import socket
import sys
import os

os.environ['SERVER_SOFTWARE'] = "Velioo's Webserver"
os.environ['SERVER_NAME'] = ''
os.environ['PORT'] = '8888'
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

supported_cgi_formats = {
    'py': sys.executable,
    'php': '/usr/bin/php-cgi7.0'
}


