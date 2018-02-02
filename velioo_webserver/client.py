import argparse
import errno
import os
import socket
from time import sleep
import resource
import signal
import asyncio

SERVER_ADDRESS = 'localhost', 8887
REQUEST = b"""\
GET /application/c10k HTTP/1.1
Host: localhost:8887
"""


def main(max_clients, max_conns):
    socks = []
    signal.signal(signal.SIGCHLD, grim_reaper)
    for i in range(max_conns):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        socks.append(sock)
    for client_num in range(max_clients):
        #~ try:
            #~ pid = os.fork()
        #~ except OSError as e:
            #~ print('Failed to create child...')
            #~ client_num-=1
        
        for connection_num in range(max_conns):
            socks[connection_num].connect(SERVER_ADDRESS)
        sleep(100000)
        #~ if pid == 0:
            #~ for connection_num in range(max_conns):
                #~ try:
                    #~ pid = os.fork()
                #~ except OSError as e:
                    #~ print('Failed to create child...')
                    #~ pid = -1
                    #~ connection_num-=1
                #~ if pid == 0:
                    #~ #sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    #~ socks[connection_num].connect(SERVER_ADDRESS)
                    #~ sleep(5)
                    #~ #sock.connect(SERVER_ADDRESS)
                    #~ socks[connection_num].sendall(REQUEST)
                    #~ #socks.append(sock)
                    #~ print(connection_num)
                    #~ os._exit(0)
            #~ os._exit(0)
        #~ else:
            #~ os.waitid(os.P_ALL, pid, os.WEXITED)


def grim_reaper(signum, frame):
    while True:
        try:
            pid, status = os.waitpid(-1, os.WNOHANG)
        except IOError:
            return
            
        if pid == 0:
            return


if __name__ == '__main__':
    resource.setrlimit(resource.RLIMIT_NOFILE, (100010, 100010))
    parser = argparse.ArgumentParser(
        description='Test client for LSBAWS.',
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        '--max-conns',
        type=int,
        default=512,
        help='Maximum number of connections per client.'
    )
    parser.add_argument(
        '--max-clients',
        type=int,
        default=1,
        help='Maximum number of clients.'
    )
    args = parser.parse_args()
    main(args.max_clients, args.max_conns)
