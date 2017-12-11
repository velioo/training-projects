import socket
import errno
import os
import sys
import subprocess
import signal
import traceback
from time import time, gmtime, asctime
from pathlib import Path
from pathlib import PurePath
import magic
from urllib.parse import unquote
import logging

logging.basicConfig(filename='logs/server.log', level=logging.DEBUG, format='%(asctime)s --> %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')
SERVER_ADDRESS = (HOST, PORT) = '', 8888
REQUEST_QUEUE_SIZE = 1024
forbidden_dirs_file = './config/forbidden_dirs.txt'
forbidden_dirs = ()


def serve_forever():
    global forbidden_dirs
    logging.info('Creating socket with AF_INET and SOCK_STREAM')
    listen_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    logging.info('Setting socket options: SOL_SOCKET, SO_REUSEADDR, 1')
    listen_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    logging.info('Binding Server Address to {host}:{port}'.format(host=SERVER_ADDRESS[0], port=SERVER_ADDRESS[1]))
    listen_socket.bind(SERVER_ADDRESS)
    logging.info('Start listening for connections...')
    logging.info('REQUEST_QUEUE_SIZE = {}'.format(REQUEST_QUEUE_SIZE))
    listen_socket.listen(REQUEST_QUEUE_SIZE)
    logging.info('Serving HTTP on port {port} ...'.format(port=PORT))
    print('Serving HTTP on port {port} ...'.format(port=PORT))
    
    logging.info('Setting SIGCHLD signals handler "grim_reaper"...')
    signal.signal(signal.SIGCHLD, grim_reaper)
    
    forbidden_dirs_l = []
    logging.info('Reading forbidden dirs list file: {}'.format(forbidden_dirs_file))
    with open(forbidden_dirs_file, 'r') as f:
        for line in f:
            forbidden_dirs_l.append(line.strip())
        forbidden_dirs = tuple(forbidden_dirs_l)
    
    logging.info('Forbidden dirs: {}'.format(", ".join(forbidden_dirs)))
    
    logging.info('Starting while loop...')
    while True:
        try:
            logging.info('Parent: Accepting connections...')
            client_connection, client_address = listen_socket.accept()
        except IOError as e:
            logging.error(traceback.format_exc())
            code, msg = e.args
            # restart 'accept' if it was interrupted
            if code == errno.EINTR:
                continue
            else:
                raise
        
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


def grim_reaper(signum, frame):
    logging.info('Parent: grim_reaper invoked')
    while True:
        try:
            logging.info('Parent: Getting status from child...')
            pid, status = os.waitpid(-1, os.WNOHANG)
            logging.info('Parent: Child returned pid = {}, status = "{}"'.format(pid, status))
        except IOError:
            #logging.error(traceback.format_exc())
            return
            
        if pid == 0: # no zombies
            logging.info('Parent: Child returned pid = 0, returning...')
            return


def handle_request(client_connection):
    pid = os.getpid()
    logging.info('Child {}: handle_request invoked...'.format(pid))
    global forbidden_dirs
    arguments = ""
    try:
        logging.info('Child {}: Receiving request...'.format(pid))
        request = client_connection.recv(4096)
        logging.info('Child {}: Decoding request...'.format(pid))
        response = request.decode('utf-8')
        logging.info('Child {}: Request:\n{}'.format(pid, response))
        lines = response.split("\n")
        method, path, protocol = lines[0].strip().split(" ")
        if method == 'GET':
            logging.info('Child {}: Request method is GET'.format(pid))
            if '?' in path:
                path, arguments = path.split("?")
                arguments = arguments.split("&")
            logging.info('Child {}: Path: {}, Arguments: {}'.format(pid, path, arguments))
            logging.info('Child {}: Converting path: {} to Path object...'.format(pid, path))
            path = convert_path(path)
            if path.is_dir() and str(path) in forbidden_dirs:
                http_response = "HTTP/1.1 403 Forbidden\r\n{}\r\n\r\nError 403 \r\nForbidden".format(asctime(gmtime(time())))
                logging.info('Child {}: Path access is forbidden, response:\n{}'.format(pid, http_response))
                client_connection.sendall(bytearray(http_response, 'utf-8'))
                return
                
            logging.info('Child {}: Getting PurePath from Path...'.format(pid))
            pure_path = PurePath(path)
            logging.info('Child {}: Checking if the Path is forbidden...'.format(pid))
            for p in pure_path.parents:
                if str(p) in forbidden_dirs:
                    http_response = b" HTTP/1.1 403 Forbidden\r\n\r\nError 403 \r\nForbidden"
                    logging.info('Child {}: Path is forbidden, directory {} is forbidden. Response:\n{}'.format(pid, str(p), http_response.decode()))
                    client_connection.sendall(http_response)
                    return
            
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
                            #for arg in arguments: script_args.append(arg)
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
                    http_response = b" HTTP/1.1 403 Forbidden\r\n\r\nError 403 \r\nForbidden"
                    logging.info('Child {}: Response:\n'.format(pid, http_response.decode()))
                    client_connection.sendall(http_response)
            else:
                logging.info('Child {}: Path doesn\'t exist'.format(pid))
                http_response = b" HTTP/1.1 404 Not Found\r\n\r\nError 404 \r\nResource not found"
                logging.info('Child {}: Response:\n'.format(pid, http_response.decode()))
                client_connection.sendall(http_response)
        elif method == 'POST':
            logging.info('Child {}: Request method is POST'.format(pid))
            #data = response.split("\n")[-1]
            print(request)
        else:
            logging.info('Child {}: Request method is unsupported: {}'.format(pid, method))

    except Exception as e:
        logging.error(traceback.format_exc())


def convert_path(path):
    if isinstance(path, str):
        return Path("./{path}".format(path=path))
    elif isinstance(path, Path):
        return path


if __name__ == '__main__':
    serve_forever()
