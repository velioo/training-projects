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
import threading
from time import time, gmtime, asctime, mktime
from wsgiref.handlers import format_date_time
from pathlib import Path
import magic
from urllib.parse import unquote
import logging
import velioo_webserver.config.environment as env
import asyncio

now = datetime.datetime.now()
logging.basicConfig(filename='logs/async_server_' + now.strftime("%Y-%m-%d") + '.log', level=logging.DEBUG, format='%(levelname)s:%(asctime)s --> %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')

def serve_forever():
    print('Starting server...')
    loop = asyncio.get_event_loop()
    coroutine = asyncio.start_server(handle_request, host=os.environ.get('SERVER_NAME', 'localhost'), 
                                   port=os.environ.get('ALT_PORT', 8887), 
                                   family=env.ADDRESS_FAMILY, 
                                   reuse_address=True)
    loop.run_until_complete(coroutine)
    signal.signal(signal.SIGCHLD, grim_reaper)
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


def handle_request(client_reader, client_writer):
    pid = os.getpid()
    logging.info('Child {}: handle_request invoked...'.format(pid))
    arguments = ""
    try:
        logging.info('Child {}: Receiving request...'.format(pid))
        
        request_headers = b''
        request_body = ''
        method, path, protocol = '', '', ''
        
        try:
            while True:
                logging.info('Child {}: Reading data...'.format(pid))
                data = yield from asyncio.wait_for(client_reader.read(env.RECV_BUFSIZE), 10.0)
                if data != b'':
                    logging.info('Child {}: Data read: {}'.format(pid, data))
                    try:
                        request_headers+=data
                    except TypeError as e:
                        logging('Child {}: Problem reading request. Request not in binary.'.format(pid))
                        logging.info('Child {}: Error 400 Bad request'.format(pid))
                        send_response_400(client_writer, pid)
                        return
                    try:
                        if b'\r\n' in request_headers and not method:
                            method, path, protocol = request_headers.split(b'\r\n')[0].decode('utf-8').strip().split(" ")
                        if b'\r\n\r\n' in request_headers:
                            temp = request_headers
                            request_headers = request_headers.split(b'\r\n\r\n')[0].decode('utf-8') + '\r\n\r\n'
                            if method == 'POST':
                                try:
                                    request_body = temp.split(b'\r\n\r\n', 1)[1]
                                except IndexError as e:
                                    logging.info("Child {}: Didn\'t parse any parts of the request body while parsing the request headers".format(pid))
                                if request_body:
                                    logging.info("Child {}: Parsed part of (the whole) request body while parsing the request headers".format(pid))
                            break
                    except ValueError as e:
                        logging.error('Child {}: Failed to parse request headers'.format(pid))
                        logging.error('Child {} Traceback:{}'.format(pid, traceback.format_exc()))
                        logging.info('Child {}: Error 400 Bad request'.format(pid))
                        send_response_400(client_writer, pid)
                        return
                else:
                    logging.info('Child {}: Request headers successfully received'.format(pid))
                    break
        except UnicodeDecodeError as e:
            logging.error("Child {}: Problem decoding request".format(pid))
            logging.error('Child {} Traceback:{}'.format(pid, traceback.format_exc()))
            send_response_500(client_writer, pid)
            return
        except TimeoutError as e:
            logging.info('Child {}: Request timeout'.format(pid))
            logging.info('Child {}: Request headers:\n{}'.format(pid, request_headers))
            send_response_408(client_writer, pid)
            return
    
        logging.info('Child {}: Request headers:\n{}'.format(pid, request_headers))
        
        if request_headers == b'':
            logging.info('Child {}: Request timeout: {}'.format(pid, method))
            send_response_408(client_writer, pid)
            return
            
        if '\r\n\r\n' not in request_headers:
            logging.info('Child {}: Error 400 Bad request'.format(pid))
            send_response_400(client_writer, pid)
            return
        
        
        headers = {}
        try:
            splitted_headers = request_headers.split('\r\n')
            for header in splitted_headers:
                if ':' in header:
                    splitted_header = header.split(":", 1)
                    if len(splitted_header) > 1:
                        headers[splitted_header[0].strip().rstrip()] = splitted_header[1].strip().rstrip()
        except Exception as e:
            logging.error("Child {}: Problem parsing headers".format(pid))
            logging.error('Child {} Traceback:{}'.format(pid, traceback.format_exc()))
            send_response_500(client_writer, pid)
            return
        
        if method == 'GET':
            logging.info('Child {}: Request method is GET'.format(pid))
        elif method == 'POST':
            logging.info('Child {}: Request method is POST'.format(pid))
            try:
                if 'Content-Length' in headers:
                    content_length = int(headers['Content-Length'])
                elif 'Content-length' in headers:
                    content_length = int(headers['Content-length'])
                elif 'content_length' in headers:
                    content_length = int(headers['content-length'])
                else:
                    send_response_411(client_writer, pid)
                    return
            except (ValueError, KeyError) as e:
                logging.info('Child {}: Failed to parse Content-Length attribute...setting Content-Length to None'.format(pid))
                logging.error('Child {} Traceback:{}'.format(pid, traceback.format_exc()))
                send_response_411(client_writer, pid)
                return
        elif method == 'OPTIONS':
            if path == '*':
                http_response = b"HTTP/1.1 200 OK\r\nAllow: OPTIONS, GET, POST\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\nContent-Length: 0\r\n"
                logging.info('Child {}: Response:{}\n'.format(pid, http_response.decode()))
                client_writer.write(http_response)
                client_writer.write_eof()
            else:
                path = convert_path(path)
                for p in env.allowed_dirs:
                    if str(path).startswith(p) and (path.is_file() or path.is_dir()):
                        http_response = b"HTTP/1.1 200 OK\r\nAllow: OPTIONS, GET, POST\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\nContent-Length: 0\r\n"
                        logging.info('Child {}: Response:{}\n'.format(pid, http_response.decode()))
                        client_writer.write(http_response)
                        client_writer.write_eof()
                        return
                http_response = b"HTTP/1.1 200 OK\r\nAllow:\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\nContent-Length: 0\r\n"
                logging.info('Child {}: Response:{}\n'.format(pid, http_response.decode()))
                client_writer.write(http_response)
                client_writer.write_eof()
                    
            return
        else:
            logging.info('Child {}: Request method is unsupported: {}'.format(pid, method))
            send_response_501(client_writer, pid)
            return
            
        if '?' in path:
            try:
                path, arguments = path.split('?')
                logging.info('Child {}: Path: {}, Arguments: {}'.format(pid, path, arguments))
            except ValueError as e:
                logging.error('Failed to split path from query params...')
                send_response_500(client_writer, pid)
                return
        logging.info('Child {}: Converting path: {} to Path object...'.format(pid, path))
        path = convert_path(path)
        if path.exists():
            path_str = str(path)
            logging.info('Child {}: Checking if {} is forbidden...'.format(pid, path_str))
            for p in env.allowed_dirs:
                if path_str.startswith(p):
                    if path.is_file() or path.is_dir():
                        if path.is_dir():
                            try:
                                path = convert_path(path_str + "/index.html")
                            except TypeError as e:
                                logging.info('Child {}: Failed to concatenate path_str to index.html...retrying with str(path) + index.html'.format(pid))
                                if isinstance(path, Path):
                                    path = convert_path(str(path) + "/index.html")
                                else:
                                    logging.info('Variable "path" is not a Path instance, concatenation aborted...')
                                    send_response_500(client_writer, pid)
                                    return
                            path_str = str(path)
                            logging.info('Child {}: Path is a directory. Changing path to {}'.format(pid, path))
                        if path.is_file():
                            logging.info('Child {}: Path is a file'.format(pid))
                            if path_str.startswith("cgi-bin") and os.access(path_str, os.X_OK):
                                logging.info('Child {}: Path is a CGI script'.format(pid))
                                try:
                                    try:
                                        ext = path_str.split('.')[-1]
                                    except ValueError as e:
                                        logging.error('Child {}: Failed getting CGI script file extension, setting ext to None'.format(pid))
                                        ext = None
                                    try:
                                        executable = env.supported_cgi_formats[ext]
                                    except KeyError as e:
                                         logging.error('Child {}: Failed getting CGI script executable. Trying with default executable: {}'.format(pid, sys.executable))
                                         executable = sys.executable
                                    if executable:
                                        set_environment(headers=headers, 
                                                        arguments=arguments, 
                                                        method=method, 
                                                        path=path_str, 
                                                        protocol=protocol, 
                                                        client_address=client_writer.get_extra_info('peername')[0],
                                                        server_port=os.environ.get('PORT', 8888)
                                                        )
                                        script_args = [executable, path_str]
                                        logging.info('Child {}: Executing {}'.format(pid, path))
                                        proc = subprocess.Popen(script_args, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                                        try:
                                            if method == 'POST':
                                                if request_body:
                                                    try:
                                                        proc.stdin.write(request_body)
                                                    except BrokenPipeError as e:
                                                        logging.info('Child {}: PIPE broke while writing...'.format(pid))
                                                        raise OSError
                                                logging.info("Child {}: Content-Length from request = {}".format(pid, content_length))
                                                logging.info("Child {}: Current Content-Length = {}".format(pid, len(request_body)))
                                                bytes_read = 0
                                                prev_content_length = len(request_body)
                                                if(content_length > len(request_body)):
                                                    logging.info('Child {}: Getting POST request body...'.format(pid))
                                                    logging.info('Child {}: POST body:'.format(pid))
                                                    while True:
                                                        logging.info('Child {}: Sending data to CGI script'.format(pid))
                                                        post_data = yield from asyncio.wait_for(client_reader.read(env.RECV_BUFSIZE), 10.0)
                                                        if post_data != b'':
                                                            bytes_read+=len(post_data)
                                                            logging.info('Child {}: Total bytes read: {}'.format(pid, bytes_read + len(request_body)))
                                                            try:
                                                                proc.stdin.write(post_data)
                                                            except BrokenPipeError as e:
                                                                logging.info('Child {}: PIPE broke while writing...'.format(pid))
                                                                raise OSError
                                                            if content_length <= bytes_read:# + len(request_body):
                                                                logging.info('Child {}: Request body successfully received'.format(pid))
                                                                break
                                                        else:
                                                            break
                                                    
                                                    if prev_content_length == len(request_body) + bytes_read:
                                                        raise TimeoutError
                                                logging.info('Child {}: Request body received. Total bytes read = {}'.format(pid, len(request_body) + bytes_read))
                                                proc.stdin.close()
                                                logging.info('Child {}: Response:\n'.format(pid))                                     
                                                line = None
                                                for line in proc.stdout:
                                                    client_writer.write(line)
                                                    yield from client_writer.drain()
                                                    logging.info('{}'.format(line.decode().replace("\n","", 1)))
                                                client_writer.write_eof()
                                                if line == None:
                                                    logging.info('Child {}: CGI script didn\'t return anything.'.format(pid))
                                                    send_response_501(client_writer, pid)
                                                    return
                                            elif method == 'GET':
                                                logging.info('Child {}: Response:\n'.format(pid))
                                                line = None
                                                for line in proc.stdout:
                                                    client_writer.write(line)
                                                    yield from client_writer.drain()
                                                    logging.info('{}'.format(line.decode().replace("\n","", 1)))
                                                client_writer.write_eof()
                                                if line == None:
                                                    logging.info('Child {}: CGI script didn\'t return anything.'.format(pid))
                                                    send_response_501(client_writer, pid)
                                                    return
                                            else:
                                                logging.info('Child {}: Failed to execute CGI script - request method is unsupported'.format(pid))
                                                send_response_501(client_writer, pid)
                                                return
                                            proc.wait(5.0)
                                        except (TimeoutError, subprocess.TimeoutExpired) as e:
                                            logging.info('Child {}: Request timeout: {}'.format(pid, method))
                                            send_response_408(client_writer, pid)
                                    else:
                                        logging.info('Child {}: Failed to execute CGI script - CGI extension not supported'.format(pid))
                                        send_response_501(client_writer, pid)
                                except OSError as e:
                                    logging.error('Child {}: Failed to execute script...'.format(pid))
                                    logging.error('Child {} Traceback:{}'.format(pid, traceback.format_exc()))
                                    send_response_500(client_writer, pid)
                            else:
                                logging.info('Child {}: Path is a resource. Loading MIME detector...'.format(pid))
                                ft_detector = magic.Magic(mime=True)
                                mime = ft_detector.from_file(path_str)
                                logging.info('Child {}: MIME: {}'.format(pid, mime))
                                http_response = (
                                                b"HTTP/1.1 200 OK\r\nContent-Type: "
                                                + bytearray(mime, 'utf-8')
                                                + b"\r\nContent-Length: "
                                                + str(os.path.getsize(path)).encode()
                                                + b"\r\nDate: "
                                                + get_current_gmt_time()
                                                + b"\r\nServer: " 
                                                + get_server_software()
                                                + b"\r\n\r\n"
                                                )
                                logging.info('Child {}: Response:\n{}'.format(pid, http_response.decode()))
                                client_writer.write(http_response)
                                with open(path, 'rb') as f:
                                    for line in f:
                                        client_writer.write(line)
                                        yield from client_writer.drain()
                                        
                                client_writer.write_eof()
                        else:
                            send_response_403(client_writer, pid)
                    else:
                        logging.info('Child {}: Path is neither a file nor dir'.format(pid))
                        send_response_403(client_writer, pid)
                    return
            logging.info('Child {}: Path {} is forbidden'.format(pid, path_str))               
            send_response_403(client_writer, pid)
            return
        else:
            logging.info('Child {}: Path doesn\'t exist'.format(pid))
            send_response_404(client_writer, pid)
            return
    
    except OSError as e:
        logging.error('Client disonnected before receiveing response...')
    except BrokenPipeError as e:
        logging.error('Child {}: Connection between server and client was broken'.format(pid))
        logging.error('Child {} Traceback:{}'.format(pid, traceback.format_exc()))
        send_response_500(client_writer, pid)
    except RuntimeError as e:
        logging.error('Child {} Traceback:{}'.format(pid, traceback.format_exc()))
        send_response_500(client_writer, pid)
    except ConnectionResetError as e:
        logging.error('Child {} Traceback:{}'.format(pid, traceback.format_exc()))
        send_response_500(client_writer, pid)
    except UnboundLocalError as e:
        logging.error('Child {} Traceback:{}'.format(pid, traceback.format_exc()))
        send_response_500(client_writer, pid)
    except Exception as e:
        logging.error('Child {} Traceback:{}'.format(pid, traceback.format_exc()))
        send_response_500(client_writer, pid)


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


def cgi_timeout(signum, frame):
    raise TimeoutError


def get_current_gmt_time():
    now = datetime.datetime.now()
    stamp = mktime(now.timetuple())
    return format_date_time(stamp).encode()


def get_server_name():
    return os.environ.get('SERVER_NAME', '127.0.0.1').encode()


def get_server_software():
    return os.environ.get('SERVER_SOFTWARE', "Velioo's Webserve").encode()


def send_response_400(client_writer, pid):
    http_response = b"HTTP/1.1 400 Bad Request\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\n\r\nError 400\r\nBad Request"
    logging.info('Child {}: Response:\n{}'.format(pid, http_response.decode()))
    client_writer.write(http_response)
    client_writer.write_eof()


def send_response_403(client_writer, pid):
    http_response = b"HTTP/1.1 403 Forbidden\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\n\r\nError 403\r\nForbidden"
    logging.info('Child {}: Response:\n{}'.format(pid, http_response.decode()))
    client_writer.write(http_response)
    client_writer.write_eof()  


def send_response_404(client_writer, pid):
    http_response = b"HTTP/1.1 404 Not Found\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\n\r\nError 404 \r\nResource not found"
    logging.info('Child {}: Response:{}\n'.format(pid, http_response.decode()))
    client_writer.write(http_response)
    client_writer.write_eof()


def send_response_408(client_writer, pid):
    http_response = b"HTTP/1.1 408 Request Timeout\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\n\r\nError 408\r\nRequest Timeout"
    logging.info('Child {}: Response:\n{}'.format(pid, http_response.decode()))
    client_writer.write(http_response)
    client_writer.write_eof()


def send_response_411(client_writer, pid):
    http_response = b"HTTP/1.1 411 Length Required\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\n\r\nError 411\r\nLength Required"
    logging.info('Child {}: Response:\n{}'.format(pid, http_response.decode()))
    client_writer.write(http_response)
    client_writer.write_eof()


def send_response_500(client_writer, pid):
    http_response = b"HTTP/1.1 500 Internal Server Error\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\n\r\nError 500\r\nInternal Server Error"
    logging.info('Child {}: Response:\n{}'.format(pid, http_response.decode()))
    client_writer.write(http_response)
    client_writer.write_eof()


def send_response_501(client_writer, pid):
    http_response = b"HTTP/1.1 501 Not Implemented\r\nDate: " + get_current_gmt_time() + b"\r\nServer: " + get_server_software() + b"\r\n\r\nError 501\r\nNot Implemented"
    logging.info('Child {}: Response:\n{}'.format(pid, http_response.decode()))
    client_writer.write(http_response)
    client_writer.write_eof()
    

if __name__ == '__main__':
    try:
        serve_forever()
    except KeyboardInterrupt as e:
        logging.info("Server closed")
        print("Server closed")
    except Exception as e:
        logging.error(e)
        print("Error occured while starting server. Check the log for more details.")
        
