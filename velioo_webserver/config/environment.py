import socket
import sys
import os

os.environ['SERVER_SOFTWARE'] = "Velioo's Webserver"
os.environ['SERVER_NAME'] = '127.0.0.1'
os.environ['PORT'] = '8888'
os.environ['ALT_PORT'] = '8887'
REQUEST_QUEUE_SIZE = 66000
ADDRESS_FAMILY = socket.AF_INET
SOCKET_TYPE = socket.SOCK_STREAM
SOCKET_OPTION_LEVEL = socket.SOL_SOCKET
SOCKET_OPTION_VALUE = socket.SO_REUSEADDR
RECV_BUFSIZE = 4096
FILE_CHUNK = 4096
SERVER_GLOBAL_REQUEST_TIMEOUT = 10.0
SERVER_SINGLE_TIMEOUT = 10.0
SERVER_GLOBAL_POST_TIMEOUT = 10.0
SERVER_POST_TIMEOUT = 10.0
SERVER_GLOBAL_CGI_TIMEOUT = 10.0
SERVER_CGI_TIMEOUT = 10.0
SERVER_KEEP_ALIVE_TIMEOUT = 5
SERVER_MAX_KEEP_ALIVE_REQUESTS = 10000
allowed_dirs = tuple([
    'application',
    'hello',
    'cgi-bin/app',
    'other',
    'cgi-bin/monitoring'
])

auth_dirs = {
    'other': 'admin:12345',
    'cgi-bin/monitoring' : 'admin:12345'
}

supported_cgi_formats = {
    'py': sys.executable,
    'php': '/usr/bin/php7.1'
}
