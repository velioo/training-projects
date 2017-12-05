import socket
import errno
import os
import signal
import pathlib
import magic

SERVER_ADDRESS = (HOST, PORT) = '', 8888
REQUEST_QUEUE_SIZE = 1024

def grim_reaper(signum, frame):
    while True:
        try:
            pid, status = os.waitpid(-1, os.WNOHANG)
        except IOError:
            return
            
        if pid == 0: # no zombies
            return

def handle_request(client_connection):
    try:
        request = client_connection.recv(4096)
        response = request.decode()
        print(response)
        lines = response.split("\n")
        method, path, protocol = lines[0].strip().split(" ")
        if method == 'GET':
            print("Request is GET")
            path = pathlib.Path("./{path}".format(path=path))
            if path.is_file() or path.is_dir():
                if path.is_file():
                    ft_detector = magic.Magic(mime=True)
                    mime = ft_detector.from_file(str(path))
                    http_response = b"HTTP/1.1 200 OK\r\nContent-Type: " + bytearray(mime, 'utf-8') + b"\r\n\r\n"
                    client_connection.sendall(http_response)
                    with open(path, 'rb') as f:
                        for line in f:
                            client_connection.sendall(line)
                else:
                    http_response = b" HTTP/1.1 200 OK\r\n\r\nResource is a directory"
                    client_connection.sendall(http_response)
            else:
                http_response = b" HTTP/1.1 404 Not Found\r\n\r\nError 404 \r\nResource not found"
                client_connection.sendall(http_response)
        else:
            print("Method is not get")

    except Exception as e:
        print(e)

def serve_forever():
    listen_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    listen_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    listen_socket.bind(SERVER_ADDRESS)
    listen_socket.listen(REQUEST_QUEUE_SIZE)
    print('Serving HTTP on port {port} ...'.format(port=PORT))
    
    signal.signal(signal.SIGCHLD, grim_reaper)

    while True:
        try:
            client_connection, client_address = listen_socket.accept()
        except IOError as e:
            code, msg = e.args
            # restart 'accept' if it was interrupted
            if code == errno.EINTR:
                continue
            else:
                raise
            
        pid = os.fork()
        if pid == 0: # child
            listen_socket.close() # close child copy
            handle_request(client_connection)
            client_connection.close()
            os._exit(0)
        else: # parent
            client_connection.close() # close parent copy and loop over

if __name__ == '__main__':
    serve_forever()
