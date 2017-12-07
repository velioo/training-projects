import socket
import errno
import os
import sys
import subprocess
import signal
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
    
    logging.info('Setting SIGCHLD signals handler...')
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
    while True:
        try:
            pid, status = os.waitpid(-1, os.WNOHANG)
        except IOError:
            return
            
        if pid == 0: # no zombies
            return


def handle_request(client_connection):
    pid = os.getpid()
    global forbidden_dirs
    arguments = ""
    try:
        request = client_connection.recv(4096)
        response = request.decode()
        print(response)
        lines = response.split("\n")
        method, path, protocol = lines[0].strip().split(" ")
        if method == 'GET':
            if '?' in path:
                path, arguments = path.split("?")
                arguments = arguments.split("&")
            print(path, arguments)
            print("Request is GET")
            path = convert_path(path)
            if path.is_dir() and str(path) in forbidden_dirs:
                http_response = b" HTTP/1.1 403 Forbidden\r\n\r\nError 403 \r\nForbidden"
                client_connection.sendall(http_response)
                return
                
            pure_path = PurePath(path)
            for p in pure_path.parents:
                #print(p)
                if str(p) in forbidden_dirs:
                    http_response = b" HTTP/1.1 403 Forbidden\r\n\r\nError 403 \r\nForbidden"
                    client_connection.sendall(http_response)
                    return
            
            path = convert_path(path)
            if path.is_file() or path.is_dir():
                if path.is_dir():
                    path = convert_path(str(path) + "/index.html")
                    #print(path)
                if path.is_file():
                    if str(path).endswith('.py'):
                        try:
                            script_args = [sys.executable, path]
                            #for arg in arguments: script_args.append(arg)
                            script_args.append(";".join(arguments))
                            print(script_args)
                            output = subprocess.check_output(script_args)
                            client_connection.sendall(b"HTTP/1.1 200 OK\r\n" + output)
                        except subprocess.CalledProcessError as e:
                            print(e.output().decode())
                    else:
                        ft_detector = magic.Magic(mime=True)
                        mime = ft_detector.from_file(str(path))
                        print(mime)
                        http_response = b"HTTP/1.1 200 OK\r\nContent-Type: " + bytearray(mime, 'utf-8') + b"\r\n\r\n"
                        client_connection.sendall(http_response)
                        with open(path, 'rb') as f:
                            for line in f:
                                client_connection.sendall(line)
                else:
                    http_response = b" HTTP/1.1 403 Forbidden\r\n\r\nError 403 \r\nForbidden"
                    client_connection.sendall(http_response)
            else:
                http_response = b" HTTP/1.1 404 Not Found\r\n\r\nError 404 \r\nResource not found"
                client_connection.sendall(http_response)
        else:
            print("Method is not get")

    except Exception as e:
        print(e)


def convert_path(path):
    if isinstance(path, str):
        return Path("./{path}".format(path=path))
    elif isinstance(path, Path):
        return path


if __name__ == '__main__':
    serve_forever()
