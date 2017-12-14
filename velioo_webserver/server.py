import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import errno
import socket
import subprocess
import signal
import traceback
import select
from time import time, gmtime, asctime
from pathlib import Path
import magic
from urllib.parse import unquote
import logging
import velioo_webserver.config.environment as env
import velioo_webserver.httpheader as http_parser

logging.basicConfig(filename='logs/server.log', level=logging.DEBUG, format='%(levelname)s:%(asctime)s --> %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')

def serve_forever():
    logging.info('Creating socket with {} and {}'.format(env.ADDRESS_FAMILY, env.SOCKET_TYPE))
    listen_socket = socket.socket(env.ADDRESS_FAMILY, env.SOCKET_TYPE)
    logging.info('Setting socket options: {}, {}, 1'.format(env.SOCKET_OPTION_LEVEL, env.SOCKET_OPTION_VALUE))
    listen_socket.setsockopt(env.SOCKET_OPTION_LEVEL, env.SOCKET_OPTION_VALUE, 1)
    logging.info('Binding Server Address to {host}:{port}'.format(host=env.HOST, port=env.PORT))
    listen_socket.bind(env.SERVER_ADDRESS)
    logging.info('Start listening for connections...')
    logging.info('REQUEST_QUEUE_SIZE = {}'.format(env.REQUEST_QUEUE_SIZE))
    listen_socket.listen(env.REQUEST_QUEUE_SIZE)
    logging.info('Serving HTTP on port {port} ...'.format(port=env.PORT))
    print('Serving HTTP on port {port} ...'.format(port=env.PORT))
    
    logging.info('Setting SIGCHLD signals handler "grim_reaper"...')
    signal.signal(signal.SIGCHLD, grim_reaper)
    logging.info('Starting while loop...')
    while True:
        try:
            logging.info('Parent: Accepting connections...')
            client_connection, client_address = listen_socket.accept()
        except IOError as e:
            logging.error(traceback.format_exc())
            code, msg = e.args
            if code == errno.EINTR:  # restart 'accept' if it was interrupted
                continue
            else:
                break
        
        logging.info('Parent: Connection accepted, invoking fork()')
        pid = os.fork()
        if pid == 0: # child
            logging.info('Child {}: Closing child copy socket...'.format(os.getpid()))
            listen_socket.close() # close child copy
            logging.info('Child {}: Handling request...'.format(os.getpid()))
            handle_request(client_connection)
            logging.info('Child {}: Closing client connection...'.format(os.getpid()))
            client_connection.close()
            logging.info('Child {}: Exiting...'.format(os.getpid()))
            os._exit(0)
        else: # parent
            logging.info('Parent: Closing parent client connection...')
            client_connection.close() # close parent copy and loop over

    logging.info("Server closed")
    print("Server closed")


def grim_reaper(signum, frame):
    while True:
        try:
            pid, status = os.waitpid(-1, os.WNOHANG)
        except IOError:
            return
            
        if pid == 0: # no zombies
            return


def handle_request(client_connection):
    pid = os.getpid()
    logging.info('Child {}: handle_request invoked...'.format(pid))
    arguments = ""
    try:
        logging.info('Child {}: Receiving request...'.format(pid))
        
        request_headers = b""
        request_body = ""
        method, path, protocol = "", "", ""
        
        client_connection.setblocking(0)
        try:
            while True:
                ready = select.select([client_connection], [], [], 10)
                if ready[0]:
                    data = client_connection.recv(env.RECV_BUFSIZE)
                    request_headers+=data
                    if b'\r\n' in request_headers and not method:
                        method, path, protocol = request_headers.split(b'\r\n')[0].decode('utf-8').strip().split(" ")
                    if b'\r\n\r\n' in request_headers:
                        temp = request_headers
                        request_headers = request_headers.split(b'\r\n\r\n')[0].decode('utf-8') + '\r\n\r\n'
                        if method == 'POST':
                            try:
                                request_body = temp.split(b'\r\n\r\n', 1)[1]
                            except IndexError as e:
                                logging.info("Didn\'t parse any parts of the request body while parsing the request headers")
                            if request_body:
                                logging.info("Parsed part of (the whole) request body while parsing the request headers")
                        break
                else:
                    break
        except UnicodeDecodeError as e:
            logging.error("Problem decoding request")
            logging.error(traceback.format_exc())
            return
    
    
        logging.info('Child {}: Request headers:\n{}'.format(pid, request_headers))
        
        if request_headers == b'':
            logging.info('Child {}: Request timeout: {}'.format(pid, method))
            http_response = b"HTTP/1.1 408 Request Timeout\r\n\r\nError 408 \r\nRequest Timeout"
            logging.info('Child {}: Response:{}\n'.format(pid, http_response.decode()))
            client_connection.sendall(http_response)
            return
            
        if '\r\n\r\n' not in request_headers:
            logging.info('Child {}: Error 400 Bad request'.format(pid))
            http_response = b"HTTP/1.1 400 Bad Request\r\n\r\nError 400 \r\nBad Request"
            logging.info('Child {}: Response:{}\n'.format(pid, http_response.decode()))
            client_connection.sendall(http_response)
            return
        
        
        headers = {}
        splitted_headers = request_headers.split('\r\n')
        try:
            for header in splitted_headers:
                if ':' in header:
                    splitted_header = header.split(":", 1)
                    if len(splitted_header) > 1:
                        headers[splitted_header[0]] = splitted_header[1].strip().rstrip()
        except Exception as e:
            logging.error(traceback.format_exc())
            headers = {}
            
        if method == 'GET':
            logging.info('Child {}: Request method is GET'.format(pid))
            if '?' in path:
                path, arguments = path.split("?")
                arguments = arguments.split("&")
            logging.info('Child {}: Path: {}, Arguments: {}'.format(pid, path, arguments))
            logging.info('Child {}: Converting path: {} to Path object...'.format(pid, path))
            path = convert_path(path)
            if path.exists():
                path_str = str(path)
                logging.info('Child {}: Checking if {} is forbidden...'.format(pid, path_str))
                for p in env.allowed_dirs:
                    if path_str.startswith(p):
                        if path.is_file() or path.is_dir():
                            if path.is_dir():
                                path = convert_path(str(path) + "/index.html")
                                logging.info('Child {}: Path is a directory. Changing path to {}'.format(pid, path))
                            if path.is_file():
                                logging.info('Child {}: Path is a file'.format(pid))
                                if str(path).startswith("cgi-bin") and str(path).endswith('.py'):
                                    logging.info('Child {}: Path is a CGI script'.format(pid))
                                    try:
                                        script_args = [sys.executable, path]
                                        script_args.append(";".join(arguments))
                                        logging.info('Child {}: Script arguments: {}'.format(pid, script_args))
                                        logging.info('Child {}: Executing {}'.format(pid, path))
                                        output = subprocess.check_output(script_args)
                                        if output.decode().startswith("***ERROR***"):
                                            http_response = b"HTTP/1.1 500 Internal Server Error\r\n\r\nError 500\r\nInternal Server Error"
                                            logging.info('Child {}: Script finished with errors: {}'.format(pid, output.decode()))
                                            logging.info('Child {}: Response:\n{}'.format(pid, http_response.decode()))
                                        else:
                                            http_response = b"HTTP/1.1 200 OK\r\n" + output
                                            logging.info('Child {}: Script finished. Response:\n{}'.format(pid, http_response.decode()))
                                        
                                        client_connection.sendall(http_response)
                                    except subprocess.CalledProcessError as e:
                                        eprint(e.output().decode())
                                else:
                                    logging.info('Child {}: Path is a resource. Loading MIME detector...'.format(pid))
                                    ft_detector = magic.Magic(mime=True)
                                    mime = ft_detector.from_file(str(path))
                                    logging.info('Child {}: MIME: {}'.format(pid, mime))
                                    http_response = b"HTTP/1.1 200 OK\r\nContent-Type: " + bytearray(mime, 'utf-8') + b"\r\n\r\n"
                                    logging.info('Child {}: Response:\n{}'.format(pid, http_response.decode()))
                                    client_connection.sendall(http_response)
                                    with open(path, 'rb') as f:
                                        for line in f:
                                            client_connection.sendall(line)
                            else:
                                logging.info('Child {}: Path is neither a file nor dir'.format(pid))
                                http_response = b"HTTP/1.1 403 Forbidden\r\n\r\nError 403 \r\nForbidden"
                                logging.info('Child {}: Response:\n'.format(pid, http_response.decode()))
                                client_connection.sendall(http_response)
                        return
                                
                http_response = b"HTTP/1.1 403 Forbidden\r\n\r\nError 403 \r\nForbidden"
                logging.info('Child {}: Path "{}" is forbidden. Response:\n{}'.format(pid, str(p), http_response.decode()))
                client_connection.sendall(http_response)
                return
            else:
                logging.info('Child {}: Path doesn\'t exist'.format(pid))
                http_response = b"HTTP/1.1 404 Not Found\r\n\r\nError 404 \r\nResource not found"
                logging.info('Child {}: Response:{}\n'.format(pid, http_response.decode()))
                client_connection.sendall(http_response)
        elif method == 'POST':
            logging.info('Child {}: Request method is POST'.format(pid))
            content_length = None
            if headers['Content-Length']:
                try:
                    content_length = int(headers['Content-Length'])
                except ValueError as e:
                    logging.error(traceback.format_exc())
                    content_length = None
            logging.info("Content-Length from request = {}".format(content_length))
            logging.info("Current Content-Length = {}".format(len(request_body)))
            bytes_read = 0
            prev_content_length = len(request_body)
            if(content_length == None or content_length > len(request_body)):
                while True:
                    ready = select.select([client_connection], [], [], 3)
                    if ready[0]:
                        post_data = client_connection.recv(env.RECV_BUFSIZE)
                        bytes_read+=len(post_data)
                        request_body+=post_data
                        if content_length != None and content_length <= bytes_read:
                            break
                    else:
                        break
                
                if request_body == b'' or request_body == prev_content_length:
                    logging.info('Child {}: Request timeout: {}'.format(pid, method))
                    http_response = b"HTTP/1.1 408 Request Timeout\r\n\r\nError 408 \r\nRequest Timeout"
                    logging.info('Child {}: Response:{}\n'.format(pid, http_response.decode()))
                    client_connection.sendall(http_response)
                    return
                    
            logging.info('Child {}: Request body received. Bytes read = {}'.format(pid, len(request_body)))
        else:
            logging.info('Child {}: Request method is unsupported: {}'.format(pid, method))
            http_response = b"HTTP/1.1 400 Bad Request\r\n\r\nError 400 \r\nBad Request"
            logging.info('Child {}: Response:{}\n'.format(pid, http_response.decode()))
            client_connection.sendall(http_response)

    except RuntimeError as e:
        logging.error(traceback.format_exc())
    except ConnectionResetError as e:
        logging.error(traceback.format_exc())
    except Exception as e:
        logging.error(traceback.format_exc())


def convert_path(path):
    if isinstance(path, str):
        return Path("./{path}".format(path=path))
    elif isinstance(path, Path):
        return path


if __name__ == '__main__':
    try:
        serve_forever()
    except Exception as e:
        logging.error(e)
        print("Error occured while starting server. Check the log for more details.")
