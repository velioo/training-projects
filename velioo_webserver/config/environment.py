import socket

SERVER_ADDRESS = (HOST, PORT) = '', 8888
REQUEST_QUEUE_SIZE = 1024
ADDRESS_FAMILY = socket.AF_INET
SOCKET_TYPE = socket.SOCK_STREAM
SOCKET_OPTION_LEVEL = socket.SOL_SOCKET
SOCKET_OPTION_VALUE = socket.SO_REUSEADDR
RECV_BUFSIZE = 4096
allowed_dirs = tuple(
[
    'application',
    'hello',
    'cgi-bin/app'
]
)
