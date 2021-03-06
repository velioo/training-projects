import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import errno
import socket
import subprocess
import signal
import traceback
import datetime
import select
import aiofiles
import time
from time import mktime
from wsgiref.handlers import format_date_time
from pathlib import Path
import resource
import logging
import velioo_webserver.config.environment as env
import asyncio
from async_logging_handler import AsyncFileHandler
import mimetypes
import gzip
import base64

now = datetime.datetime.now()
async_handler = AsyncFileHandler('logs/async_server_' + now.strftime("%Y-%m-%d") + '.log')
logging.basicConfig(level=logging.ERROR, format='%(levelname)s:%(asctime)s --> %(message)s', datefmt='%m/%d/%Y %H:%M:%S', handlers=[async_handler])

def serve_forever():
    print('Starting server...')
    loop = asyncio.get_event_loop()
    coroutine = asyncio.start_server(handle_request, host=os.environ.get('SERVER_NAME', 'localhost'), 
                                   port=os.environ.get('ALT_PORT', 8888),
                                   backlog=env.REQUEST_QUEUE_SIZE,
                                   family=env.ADDRESS_FAMILY, 
                                   reuse_address=True)
    loop.run_until_complete(coroutine)
    loop.add_signal_handler(signal.SIGCHLD, grim_reaper)
    os.environ['SERVER_TYPE'] = 'ASYNC'
    try:
        resource.setrlimit(resource.RLIMIT_NOFILE, (100000, 100000))
    except ValueError as e:
        logging.error(traceback.format_exc())
        return
    while True:
        try:
            loop.run_forever()
        except TimeoutError as e:
            logging.error('Parent: Traceback: ' + traceback.format_exc())
        except Exception as e:
            logging.error('Parent: Traceback: ' + traceback.format_exc())


def grim_reaper(signum, frame):
    while True:
        try:
            pid, status = os.waitpid(-1, os.WNOHANG)
        except IOError:
            return
            
        if pid == 0:
            return


async def handle_request(client_reader, client_writer):
    logging.info('handle_request invoked...')
    requests_processed = 0
    keep_alive = False
    while requests_processed == 0 or (keep_alive and requests_processed < env.SERVER_MAX_KEEP_ALIVE_REQUESTS):
        requests_processed+=1
        logging.info('Requests processed: {}'.format(requests_processed))
        try:
            logging.info('Receiving request...')
            request_headers = b''
            request_body = b''
            method, path, protocol = '', '', ''
            data = b''
            try:
                confirmed_request = True
                if keep_alive:
                    confirmed_request = False
                else:
                    timeout = time.time() + env.SERVER_GLOBAL_REQUEST_TIMEOUT
                while True:
                    logging.info('Reading data...')
                    try:
                        if not confirmed_request:
                            data = await asyncio.wait_for(client_reader.read(env.RECV_BUFSIZE), env.SERVER_KEEP_ALIVE_TIMEOUT)
                            confirmed_request = True
                            timeout = time.time() + env.SERVER_GLOBAL_REQUEST_TIMEOUT
                        else:
                            data = await asyncio.wait_for(client_reader.read(env.RECV_BUFSIZE), env.SERVER_SINGLE_TIMEOUT)
                    except asyncio.TimeoutError as e:
                        logging.error('Client timed out...')
                        send_response_408(client_writer)
                        return
                    try:
                        if time.time() > timeout:
                            raise TimeoutError
                    except TimeoutError as e:
                        logging.error('Global client timed out...')
                        send_response_408(client_writer)
                        return
                    if data != b'':
                        logging.info('Data read: {}'.format(data))
                        try:
                            request_headers+=data
                        except TypeError as e:
                            logging('Problem reading request. Request not in binary.')
                            logging.info('Error 400 Bad request')
                            send_response_400(client_writer)
                            return
                        try:
                            if b'\r\n' in request_headers and not method:
                                method, path, protocol = request_headers.split(b'\r\n')[0].decode('utf-8').strip().split(" ")
                            if b'\r\n\r\n' in request_headers:
                                request_headers = request_headers.split(b'\r\n\r\n')[0] + b'\r\n\r\n'
                                if method == 'POST':
                                    try:
                                        request_body = request_headers.split(b'\r\n\r\n', 1)[1]
                                    except IndexError as e:
                                        logging.info("Didn\'t parse any parts of the request body while parsing the request headers")
                                    if request_body:
                                        logging.info("Parsed part of (the whole) request body while parsing the request headers")
                                break
                        except ValueError as e:
                            logging.error('Failed to parse request headers')
                            logging.error('Traceback:{}'.format(traceback.format_exc()))
                            logging.info('Error 400 Bad request')
                            send_response_400(client_writer)
                            return
                    else:
                        logging.info('Request headers successfully received')
                        break      
            except UnicodeDecodeError as e:
                logging.error("Problem decoding request")
                logging.error('Traceback:{}'.format(traceback.format_exc()))
                send_response_500(client_writer)
                return
            logging.info('Request headers:\n{}'.format(request_headers.decode('utf-8')))
            if request_headers == b'':
                logging.info('Request timeout: {}'.format(method))
                send_response_408(client_writer)
                return
            if b'\r\n\r\n' not in request_headers:
                logging.info('Error 400 Bad request')
                send_response_400(client_writer)
                return
            headers = {}
            try:
                splitted_headers = request_headers.decode('utf-8').split('\r\n')
                for header in splitted_headers:
                    if ':' in header:
                        splitted_header = header.split(":", 1)
                        if len(splitted_header) > 1:
                            headers[splitted_header[0].strip().rstrip()] = splitted_header[1].strip().rstrip()
                
                connection = None
                try:
                    if 'Connection' in headers:
                        connection = headers['Connection']
                    elif 'connection' in headers:
                        connection = headers['connection']
                except (ValueError, KeyError) as e:
                    logging.error('Failed to get connection header')
                    logging.error('Traceback: {}'.format(traceback.format_exc()))
                
                if connection.lower() == 'keep-alive':
                    keep_alive = True
                elif connection.lower() == 'close':
                    keep_alive = False
                      
            except (ValueError, KeyError) as e:
                logging.error("Problem parsing headers")
                logging.error('Traceback:{}'.format(traceback.format_exc()))
                send_response_500(client_writer)
                return
            
            if method == 'GET':
                logging.info('Request method is GET')
            elif method == 'POST':
                logging.info('Request method is POST')
                try:
                    if 'Content-Length' in headers:
                        content_length = int(headers['Content-Length'])
                    elif 'Content-length' in headers:
                        content_length = int(headers['Content-length'])
                    elif 'content_length' in headers:
                        content_length = int(headers['content-length'])
                    else:
                        send_response_411(client_writer)
                        if keep_alive:
                            continue
                        else:
                            client_writer.close()
                            return
                except (ValueError, KeyError) as e:
                    logging.info('Failed to parse Content-Length attribute...setting Content-Length to None')
                    logging.error('Traceback:{}'.format(traceback.format_exc()))
                    send_response_411(client_writer)
                    if keep_alive:
                        continue
                    else:
                        client_writer.close()
                        return
            elif method == 'OPTIONS':
                if path == '*':
                    http_response = b"HTTP/1.1 200 OK\r\nAllow: OPTIONS, GET, POST\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\nContent-Length: 0\r\n"
                    logging.info('Response:{}\n'.format(http_response.decode()))
                    client_writer.write(http_response)
                else:
                    logging.info('Client peername = {}'.format(client_writer.get_extra_info('peername')[0]))
                    path_is_allowed = False
                    path = convert_path(path)
                    path_str = str(path)
                    if path.exists():
                        for p in env.allowed_dirs:
                            if path_str.startswith(p) and (path.is_file() or path.is_dir()):
                                path_is_allowed = True
                                break
                        if path_is_allowed:        
                            http_response = b"HTTP/1.1 200 OK\r\nAllow: OPTIONS, GET, POST\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\nContent-Length: 0\r\n"
                            logging.info('Response:{}\n'.format(http_response.decode()))
                            client_writer.write(http_response)
                    http_response = b"HTTP/1.1 200 OK\r\nAllow:\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\nContent-Length: 0\r\n"
                    logging.info('Response:{}\n'.format(http_response.decode()))
                    client_writer.write(http_response)
                    
                if keep_alive:
                    continue
                else:
                    client_writer.close()
                    return
            else:
                logging.info('Request method is unsupported: {}'.format(method))
                send_response_501(client_writer)
                return
            
            arguments = ""    
            if '?' in path:
                try:
                    path, arguments = path.split('?')
                    logging.info('Path: {}, Arguments: {}'.format(path, arguments))
                except ValueError as e:
                    logging.error('Failed to split path from query params...')
                    send_response_500(client_writer)
                    return
            logging.info('Converting path: {} to Path object...'.format(path))
            path = convert_path(path)
            if path.exists():
                path_str = str(path)
                path_has_auth = False
                logging.info('Checking if user has access to {}...'.format(path_str))
                for key, user_pass in env.auth_dirs.items():
                    if path_str.startswith(key):
                        path_has_auth = True
                        path_access_granted = False
                        if 'Authorization' in headers:
                            logging.info('Authorization field found')
                            try:
                                auth_type, base64_str = headers['Authorization'].split()
                                if auth_type == 'Basic':
                                    logging.info('Authorization type is basic')
                                    if base64.b64decode(base64_str).decode('utf-8') == user_pass:
                                        logging.info('User and pass matched. Granting access...')
                                        path_access_granted = True
                            except ValueError as e:
                                logging.error('Traceback: {}'.format(traceback.format_exc()))
                
                if path_has_auth:
                    if not path_access_granted:
                        logging.info('Authorization required or username or password is invalid')
                        send_response_401(client_writer)
                        if keep_alive:
                            continue
                        else:
                            client_writer.close()
                            return
                logging.info('Checking if {} is forbidden...'.format(path_str))
                path_is_allowed = False
                for p in env.allowed_dirs:
                    if path_str.startswith(p):
                        path_is_allowed = True
                        break
                if path_is_allowed:        
                    if path.is_file() or path.is_dir():
                        if path.is_dir():
                            try:
                                path = convert_path(path_str + "/index.html")
                            except TypeError as e:
                                logging.info('Failed to concatenate path_str to index.html...retrying with str(path) + index.html')
                                if isinstance(path, Path):
                                    path = convert_path(str(path) + "/index.html")
                                    path_str = str(path)
                                else:
                                    logging.info('Variable "path" is not a Path instance, concatenation aborted...')
                                    send_response_500(client_writer)
                                    return
                            path_str = str(path)
                            logging.info('Path is a directory. Changing path to {}'.format(path))
                        if path.is_file():
                            logging.info('Path is a file')
                            if path_str.startswith("cgi-bin") and os.access(path_str, os.X_OK):
                                logging.info('Path is a CGI script')
                                try:
                                    try:
                                        ext = path_str.split('.')[-1]
                                    except ValueError as e:
                                        logging.error('Failed getting CGI script file extension, setting ext to None')
                                        ext = None
                                    try:
                                        executable = env.supported_cgi_formats[ext]
                                    except KeyError as e:
                                         logging.error('Failed getting CGI script executable. Trying with default executable: {}'.format(sys.executable))
                                         executable = sys.executable
                                    if executable:
                                        set_environment(headers=headers, 
                                                        arguments=arguments, 
                                                        method=method, 
                                                        path=path_str, 
                                                        protocol=protocol, 
                                                        client_address=client_writer.get_extra_info('peername')[0],
                                                        server_port=os.environ.get('ALT_PORT', 8888)
                                                        )
                                        logging.info('Executing {}'.format(path))
                                        proc = await asyncio.create_subprocess_exec(executable, path_str, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                                        try:
                                            if method == 'POST':
                                                if request_body:
                                                    try:
                                                        proc.stdin.write(request_body)
                                                    except BrokenPipeError as e:
                                                        logging.info('PIPE broke while writing...')
                                                        raise OSError
                                                logging.info("Content-Length: {}".format(content_length))
                                                logging.info("Current Content-Length: {}".format(len(request_body)))
                                                bytes_read = len(request_body)
                                                prev_content_length = len(request_body)
                                                if(content_length > bytes_read):
                                                    logging.info('Getting POST request body...')
                                                    timeout = time.time() + env.SERVER_GLOBAL_POST_TIMEOUT
                                                    while True:
                                                        logging.info('Sending data to CGI script')
                                                        try:
                                                            post_data = await asyncio.wait_for(client_reader.read(env.RECV_BUFSIZE), env.SERVER_POST_TIMEOUT)
                                                        except asyncio.TimeoutError as e:
                                                            logging.error('Cient timed out...')
                                                            logging.error(traceback.format_exc())
                                                            send_response_408(client_writer)
                                                            return
                                                        try:
                                                            if time.time() > timeout:
                                                                raise TimeoutError
                                                        except TimeoutError as e:
                                                            logging.error('Global client timed out...')
                                                            logging.error(traceback.format_exc())
                                                            send_response_408(client_writer)
                                                            return
                                                        if post_data != b'':
                                                            bytes_read+=len(post_data)
                                                            logging.info('Total bytes read: {}'.format(bytes_read))
                                                            try:
                                                                proc.stdin.write(post_data)
                                                            except BrokenPipeError as e:
                                                                logging.info('PIPE broke while writing...')
                                                                raise OSError
                                                            if content_length <= bytes_read:
                                                                logging.info('Request body successfully received')
                                                                break
                                                        else:
                                                            break
                                                    
                                                    if prev_content_length == bytes_read:
                                                        raise TimeoutError
                                                logging.info('Request body received. Total bytes read = {}'.format(bytes_read))
                                                proc.stdin.close()
                                                logging.info('Response:\n')
                                                timeout = time.time() + env.SERVER_GLOBAL_CGI_TIMEOUT
                                                chunk = None
                                                while True:
                                                    logging.info('Getttng chunks from CGI script...\n')
                                                    chunk = await asyncio.wait_for(proc.stdout.read(env.RECV_BUFSIZE), env.SERVER_CGI_TIMEOUT)
                                                    if not chunk:
                                                        break
                                                    if time.time() > timeout:
                                                        raise TimeoutError
                                                    client_writer.write(chunk)
                                                    await client_writer.drain()
                                                    logging.info('{}'.format(chunk.decode().replace("\n","", 1)))
                                                if chunk == None:
                                                    logging.info('CGI script didn\'t return anything.')
                                                    send_response_501(client_writer)
                                                    return
                                                else:
                                                    if keep_alive:
                                                        continue
                                                    else:
                                                        client_writer.close()
                                                        return
                                            elif method == 'GET':
                                                logging.info('Response:\n')
                                                timeout = time.time() + env.SERVER_GLOBAL_CGI_TIMEOUT
                                                chunk = None
                                                while True:
                                                    try:
                                                        logging.info('Getttng chunks from CGI script...')
                                                        chunk = await asyncio.wait_for(proc.stdout.read(env.RECV_BUFSIZE), env.SERVER_CGI_TIMEOUT)
                                                    except asyncio.TimeoutError as e:
                                                        logging.error('CGI script timed out')
                                                        logging.error(traceback.format_exc())
                                                        send_response_408(client_writer)
                                                    if not chunk:
                                                        break
                                                    if time.time() > timeout:
                                                        raise TimeoutError
                                                    client_writer.write(chunk)
                                                    await client_writer.drain()
                                                    logging.info('{}'.format(chunk.decode().replace("\n","", 1)))
                                                if chunk == None:
                                                    logging.info('CGI script didn\'t return anything.')
                                                    send_response_501(client_writer)
                                                    return
                                                else:
                                                    if keep_alive:
                                                        continue
                                                    else:
                                                        client_writer.close()
                                                        return
                                            else:
                                                logging.info('Failed to execute CGI script - request method is unsupported')
                                                send_response_501(client_writer)
                                                return
                                        except TimeoutError as e:
                                            logging.info('Request timeout: {}'.format(method))
                                            send_response_408(client_writer)
                                    else:
                                        logging.info('Failed to execute CGI script - CGI extension not supported')
                                        send_response_501(client_writer)
                                except OSError as e:
                                    logging.error('Failed to execute script...')
                                    logging.error('Traceback:{}'.format(traceback.format_exc()))
                                    send_response_500(client_writer)
                            else:
                                logging.info('Path is a resource. Guessing MIME type...')
                                try:
                                    mime = mimetypes.guess_type(path_str, False)[0]
                                    if mime == None:
                                        mime = 'type/subtype'
                                except KeyError as e:
                                    logging.error('Failed to get MIME type...')
                                    logging.error('Traceback: {}'.format(traceback.format_exc()))
                                    mime = 'type/subtype'
                                logging.info('MIME: {}'.format(mime))
                                accept_encodings = []
                                try:
                                    if 'Accept-Encoding' in headers:
                                        accept_encodings = "".join(headers['Accept-Encoding'].split()).split(',')
                                    elif 'Accept-encoding' in headers:
                                        accept_encodings = "".join(headers['Accept-encoding'].split()).split(',')
                                    elif 'accept-encoding' in headers:
                                        accept_encodings = "".join(headers['accept-encoding'].split()).split(',')
                                except (ValueError, KeyError) as e:
                                    logging.error('KeyError while checking accept-encoding header')
                                    logging.error('Traceback: {}'.format(traceback.format_exc()))
                                
                                gzip_response = False
                                if 'gzip' in accept_encodings:
                                    gzip_response = True
                                    gzip_path = convert_path('temp/' + path_str.replace('/', '_') + '.tar.gz')                                                  
                                    logging.info(str(gzip_path))
                                if gzip_response:
                                    if not gzip_path.exists() or not os.access(str(gzip_path), os.R_OK) or os.path.getmtime(gzip_path) < os.path.getmtime(path):                          
                                        async with aiofiles.open(path, 'rb') as f_in:
                                            with gzip.open(gzip_path, 'wb') as f_out:
                                                while True:
                                                    chunk = await f_in.read(env.FILE_CHUNK)
                                                    if not chunk:
                                                        break
                                                    f_out.write(chunk)        
                                                                        
                                    path = gzip_path
                                    
                                filesize = os.path.getsize(path) 
                                http_response = (
                                            b"HTTP/1.1 200 OK\r\nContent-Type: "
                                            + bytearray(mime, 'utf-8')
                                            + b"\r\nContent-Length: "
                                            + str(filesize).encode()
                                            + b"\r\nDate: "
                                            + get_current_gmt_time()
                                            + b"\r\nServer: " 
                                            + get_server_software()
                                            )
                                if keep_alive:
                                    http_response+=b"\r\nConnection: Keep-Alive"
                                    http_response+=bytearray("\r\nKeep-Alive: timeout={}, max={}".format(env.SERVER_KEEP_ALIVE_TIMEOUT, 
                                        env.SERVER_MAX_KEEP_ALIVE_REQUESTS), 'utf-8')
                                else:
                                    http_response+=b"\r\nConnection: close"
                                if gzip_response:
                                    http_response+=b"\r\nContent-Encoding: gzip"
                                http_response+=b"\r\n\r\n"
                                client_writer.write(http_response)
                                logging.info('Response:\n{}'.format(http_response.decode()))                            
                                try:
                                    #await send_static_file(path, client_writer, os.path.getsize(path))
                                    timeout = time.time() + 10
                                    async with aiofiles.open(path, 'rb') as f:
                                        chunk = await f.read(env.FILE_CHUNK)
                                        client_writer.write(chunk)
                                        bytes_read = len(chunk)
                                        if bytes_read >= filesize:
                                            logging.info('Bytes read: {}'.format(bytes_read))
                                            #~ if gzip_response:
                                                #~ os.remove(path)
                                            if keep_alive:
                                                continue
                                            else:
                                                client_writer.close()
                                                return                                   
                                        await client_writer.drain()
                                        logging.info('While loop')
                                        while True:
                                            chunk = await f.read(env.FILE_CHUNK)
                                            client_writer.write(chunk)
                                            bytes_read+=len(chunk)
                                            if bytes_read >= filesize:
                                                logging.info('Bytes read: {}'.format(bytes_read))
                                                #~ if gzip_response:
                                                    #~ os.remove(path)
                                                if keep_alive:
                                                    continue
                                                else:
                                                    client_writer.close()
                                                    return
                                            await client_writer.drain()
                                            if time.time() > timeout:
                                                raise TimeoutError
                                        
                                                    
                                except TimeoutError as e:
                                    send_response_408(client_writer)
                                    logging.error('Timeout while writing to client')
                                    
                        else:
                            send_response_403(client_writer)
                            if not keep_alive:
                                client_writer.close()
                                return
                    else:
                        logging.info('Path is neither a file nor dir')
                        send_response_403(client_writer)
                        if not keep_alive:
                            client_writer.close()
                            return
                else:
                    logging.info('Path {} is forbidden'.format(path_str))               
                    send_response_403(client_writer)
                    if not keep_alive:
                        client_writer.close()
                        return
            else:
                logging.info('Path doesn\'t exist')
                send_response_404(client_writer)
                
        except ConnectionError as e:
            logging.error('Connection between server and client was broken')
            logging.error('Traceback:{}'.format(traceback.format_exc()))
            send_response_500(client_writer)
            return
        except OSError as e:
            logging.error('Client disonnected before receiving response...')
            logging.error('Traceback:{}'.format(traceback.format_exc()))
            send_response_500(client_writer)
        except RuntimeError as e:
            logging.error('Traceback:{}'.format(traceback.format_exc()))
            send_response_500(client_writer)
        except UnboundLocalError as e:
            logging.error('Traceback:{}'.format(traceback.format_exc()))
            send_response_500(client_writer)
        except Exception as e:
            logging.error('Traceback:{}'.format(traceback.format_exc()))
            send_response_500(client_writer)
        if not keep_alive:
            return
    
    send_response_408(client_writer)
    
    
#~ async def send_static_file(path, client_writer, filesize):
    #~ timeout = time.time() + 10
    #~ async with aiofiles.open(path, 'rb') as f:
        #~ while True:
            #~ chunk = await f.read(env.FILE_CHUNK)
            #~ client_writer.write(chunk)
            #~ if len(chunk) >= filesize:
                #~ break
            #~ await client_writer.drain()
            #~ if time.time() > timeout:
                #~ raise TimeoutError


def convert_path(path):
    if isinstance(path, str):
        return Path("./{path}".format(path=path))
    elif isinstance(path, Path):
        return path


def set_environment(*args, **kwargs):
    SERVER_PROTOCOL = kwargs['protocol']
    os.environ['SERVER_PORT'] = kwargs.get('server_port', '')
    os.environ['REQUEST_METHOD'] = kwargs.get('method', '')
    os.environ['QUERY_STRING'] = kwargs.get('arguments', '')
    os.environ['SCRIPT_NAME'] = kwargs.get('path', '')
    os.environ['CONTENT_TYPE'] = kwargs.get('headers').get('Content-Type', '')
    os.environ['CONTENT_LENGTH'] = kwargs.get('headers').get('Content-Length', '')
    os.environ['REMOTE_ADDR'] = kwargs.get('client_address', '')


def get_current_gmt_time():
    now = datetime.datetime.now()
    stamp = mktime(now.timetuple())
    return format_date_time(stamp).encode()


def get_server_name():
    return os.environ.get('SERVER_NAME', '127.0.0.1').encode()


def get_server_software():
    return os.environ.get('SERVER_SOFTWARE', "Velioo's Webserver").encode()


def send_response_400(client_writer):
    http_response = b"HTTP/1.1 400 Bad Request\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\nConnection: close" + b"\r\n\r\nError 400\r\nBad Request"
    logging.info('Response:\n{}'.format(http_response.decode()))
    client_writer.write(http_response)
    client_writer.close()

def send_response_401(client_writer, keep_alive=False):
    http_response = b"HTTP/1.1 401 Unauthorized\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b'\r\nWWW-Authenticate: Basic realm="Access to staging site"' + b"\r\n\r\nError 401\r\nUnauthorized"
    logging.info('Response:\n{}'.format(http_response.decode()))
    client_writer.write(http_response)
    if not keep_alive:
        client_writer.close()

def send_response_403(client_writer, keep_alive=False):
    http_response = b"HTTP/1.1 403 Forbidden\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\n\r\nError 403\r\nForbidden"
    logging.info('Response:\n{}'.format(http_response.decode()))
    client_writer.write(http_response)
    if not keep_alive:
        client_writer.close()


def send_response_404(client_writer):
    http_response = b"HTTP/1.1 404 Not Found\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\nConnection: close" + b"\r\n\r\nError 404 \r\nResource not found"
    logging.info('Response:{}\n'.format(http_response.decode()))
    client_writer.write(http_response)
    client_writer.close()


def send_response_408(client_writer, *other):
    http_response = b"HTTP/1.1 408 Request Timeout\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\nConnection: close"
    for header in other:
        http_response+=b"\r\n" + header
    http_response+=b"\r\n\r\nError 408\r\nRequest Timeout"
    logging.info('Response:\n{}'.format(http_response.decode()))
    client_writer.write(http_response)
    client_writer.close()


def send_response_411(client_writer, keep_alive=False):
    http_response = b"HTTP/1.1 411 Length Required\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\n\r\nError 411\r\nLength Required"
    logging.info('Response:\n{}'.format(http_response.decode()))
    client_writer.write(http_response)
    if not keep_alive:
        client_writer.close()


def send_response_500(client_writer):
    http_response = b"HTTP/1.1 500 Internal Server Error\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\nConnection: close" + b"\r\n\r\nError 500\r\nInternal Server Error"
    logging.info('Response:\n{}'.format(http_response.decode()))
    client_writer.write(http_response)
    client_writer.close()


def send_response_501(client_writer):
    http_response = b"HTTP/1.1 501 Not Implemented\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\nConnection: close" + b"\r\n\r\nError 501\r\nNot Implemented"
    logging.info('Response:\n{}'.format(http_response.decode()))
    client_writer.write(http_response)
    client_writer.close()


if __name__ == '__main__':
    try:
        serve_forever()
    except KeyboardInterrupt as e:
        logging.info("Server closed")
        print("Server closed")
    except Exception as e:
        logging.error(e)
        print("Error occured while starting server. Check the log for more details.")
        
