import socket
import sys
import os

os.environ['SERVER_SOFTWARE'] = "Velioo's Webserver"
os.environ['SERVER_NAME'] = '127.0.0.1'
os.environ['PORT'] = '8888'
os.environ['ALT_PORT'] = '8887'
REQUEST_QUEUE_SIZE = 2048
ADDRESS_FAMILY = socket.AF_INET
SOCKET_TYPE = socket.SOCK_STREAM
SOCKET_OPTION_LEVEL = socket.SOL_SOCKET
SOCKET_OPTION_VALUE = socket.SO_REUSEADDR
RECV_BUFSIZE = 4096
allowed_dirs = tuple([
    'application',
    'hello',
    'cgi-bin/app'
])

limited_dirs = tuple ([
    'cgi-bin/monitoring'
])

supported_cgi_formats = {
    'py': sys.executable,
    'php': '/usr/bin/php7.1'
}

os.environ['NUM_REQUESTS'] = '0'
