import socket
import pathlib

SERVER_ADDRESS = (HOST, PORT) = '', 8888
REQUEST_QUEUE_SIZE = 5

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
                    http_response = b" HTTP/1.1 200 OK\n\nResource is a file"
                else:
                    http_response = b" HTTP/1.1 200 OK\n\nResource is a directory"
            else:
                http_response = b" HTTP/1.1 200 OK\n\nResource not found"
        else:
            print("Method is not get")

        client_connection.sendall(http_response)
    except Exception as e:
        print(e)

def serve_forever():
    listen_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    listen_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    listen_socket.bind(SERVER_ADDRESS)
    listen_socket.listen(REQUEST_QUEUE_SIZE)
    print('Serving HTTP on port {port} ...'.format(port=PORT))

    while True:
        client_connection, client_address = listen_socket.accept()
        handle_request(client_connection)
        client_connection.close()

if __name__ == '__main__':
    serve_forever()
