#!/usr/bin/perl -w
use strict;
use warnings;
use Log::Log4perl;
use IO::Socket;
use IO::Select;
use Try::Tiny;
use English;
use MIME::Types;
use BSD::Resource;
use POSIX ":sys_wait_h";
Log::Log4perl->init('config/log.conf');
#~ use lib "/home/velioo/training-projects/velioo_webserver_perl/lib";
#~ use web;

my $QUEUE_SIZE = 10000;
my $CHUNK = 4096;
my $RLIMIT = 65535;
my $CLRF = "\r\n";
my $TIMEOUT = 10;
my $log = Log::Log4perl->get_logger();
my $types = MIME::Types->new;
my @allowed_dirs = 
(
    './application',
);

try {
    $log->info("Setting number of open files limit...");
    my $success = setrlimit(RLIMIT_NOFILE, $RLIMIT, $RLIMIT);
    if (!$success) { die "Failed to set open files limit"; } else { $log->info("Number of open files set to ${RLIMIT}"); }
} catch {
    $log->error("Error while setting number of open files: $_");
};

my $port = shift || 8886;
my $socket;
try {
    $socket = IO::Socket::INET->new ( LocalPort => $port,
                                         Listen    => $QUEUE_SIZE,
                                         ReuseAddr => 1 )
                                        or die "Can't create listen socket: $!";
} catch {
    $log->error("Error while starting server: $_");
};
$log->info("Listening on port $port");
print "Listening on port $port\n";

my $conn;
my $pid;
$SIG{CHLD} = 'IGNORE';

while(1) {
    try {
        try {        
            $log->info('Parent: Accepting new connections...');
            $conn = $socket->accept;
            if (not defined $conn) {
                die "Accept interrupted";
            }
            $log->info('Parent: Connection accepted');
        } catch {
            $log->error("Parent: Error while accepting connections: $_");
            next;
        };
        $log->info('Parent: New connection accepted');
        
        $pid = fork();
        if (not defined $pid) { die "Failed to create child copy" };
        
        if (!$pid) {
            try {
                $log->info("Child ${PID}: Closing child copy");
                if (not defined $socket) { die "Problem closing parent copy socket - socket is undefined" }
                close $socket;
                $log->info("Child ${PID}: invoking handle_connection");
                handle_connection($conn);
                $log->info("Child ${PID}: Closing connection");
                if (not defined $conn) { die "Problem closing client socket - socket is undefined" }
                close $conn;
            } catch {
                $log->error("Child ${PID}: Error occurred while processing client request: Error: $_");
            };
            
            exit;
        } else {
            $log->info("Parent: Closing parent copy");
            if (not defined $conn) { die "Problem closing socket - socket is undefined" }
            close $conn;
        }
    } catch {
        $log->error("Parent: Error occurred while processing client connection. Error: $_");
    }
}

sub handle_connection {
    $log->info("Child ${PID}: In handle connection");
    my $conn = shift;
    my $request_headers = "";
    my $request_body = "";
    my $method, my $path, my $protocol;
    my $timed_out = "";
    try {
        my @ready;
        my $data;
        my $sel = new IO::Select($conn);
        my $timeout = time + $TIMEOUT;
        while(1) {
            $log->info("Child ${PID}: Waiting to read from client");
            @ready = $sel->can_read($TIMEOUT);
            $log->info("Child ${PID}: Read handle ready");
            if (!scalar(@ready)) {
                $log->error("Child ${PID}: Client timed out");
                send_response_408($conn);
                $timed_out = 1;
                last;
            }
            if (time > $timeout) {
                $log->error("Child ${PID}: Client global timed out");
                send_response_408($conn);
                $timed_out = 1;
                last;
            }
            $log->info("Child ${PID}: Receiving data");
            $conn->recv($data, $CHUNK);
            if (not defined $conn) { die "Problem receiving data from client" };
            $log->info("Child ${PID}: Data received");
            $log->info("Child ${PID}: Data read: ${data}");
            if ($data eq "") {
                $log->info("Child ${PID}: Client didn\'t send any data");
                last;
            }
            
            $request_headers.=$data;
            
            if (index($request_headers, $CLRF) != -1 and !$protocol) {
                $log->info("Child ${PID}: New line found");
                $log->info("Child ${PID}: Splitting status line...");
                ($method, $path, $protocol) = split(/\s+/ , [split(/\r\n/, $request_headers, 2)]->[0]);
                $log->info("Child ${PID}: Line splitted");
                $path = '.' . $path;
                $log->info("Child ${PID}: Method: " . $method . ", Path: " . $path . ", Protocol: " . $protocol);
            }
            if (index($request_headers, $CLRF x 2) != -1) {
                $log->info("Child ${PID}: Double new line found");
                $log->info("Child ${PID}: Splitting headers from body...");
                ($request_headers, $request_body) = split(/\r\n\r\n/, $request_headers);
                $log->info("Child ${PID}: Headers and body splitted");
                $request_headers.=$CLRF x 2;
                $log->info("Child ${PID}: Request Headers: ${request_headers}\nRequest Body: ${request_body}");
                last;
            }
        }
    } catch {
        $log->error("Child ${PID}: Error while reading from client. Error: $_");
        send_response_500($conn);
        return;
    };
    
    if ($timed_out) {
        return;
    }
    try {
        if ($request_headers eq "" || index($request_headers, $CLRF x 2) == -1) {
            $log->error("Child ${PID}: Request is empty or invalid");
            send_response_400($conn);
            return;
        }
    } catch {
        $log->error("Child ${PID}: Error: $_");
    }
    try {
        if ($method eq "GET") {
            $log->info("Child ${PID}: Method is GET");
            my $path_is_allowed = "";
             if (-e $path) {
                $log->info("Child ${PID}: File ${path} exists");
                if (-r $path) {
                    $log->info("Child ${PID}: File has read permissions. Checking path is forbidden...");
                    foreach (@allowed_dirs) {
                        if (index($path, $_) != -1) {
                            $path_is_allowed = 1;
                            last;
                        }
                    }
                    if ($path_is_allowed) {
                        $log->info("Child ${PID}: Path is not forbidden");
                            if (-d $path) {
                                try {
                                    $log->info("Child ${PID}: Path is a directory");
                                    $path.= (substr($path, length($path) - 1, 1) ne "/") ? "/index.html" : "index.html";
                                    $log->info("Child ${PID}: New path: ${path}");
                                } catch {
                                    die "Error while concatenating index page. Error: $_";
                                };
                            }
                            if (-f $path) {
                                $log->info("Child ${PID}: Path is as file. Getting MIME type...");
                                my $mime = $types->mimeTypeOf($path);
                                $log->info("Child ${PID}: MIME is ${mime}");
                                $log->info("Child ${PID}: Getting file size");
                                my $filesize = -s $path;
                                $log->info("Child ${PID}: File size is ${filesize}");
                                my $http_response = "HTTP/1.1 200 OK${CLRF}Content-Type: ${mime}${CLRF}Content-Length: ${filesize}${CLRF}${CLRF}";
                                $conn->send($http_response);
                                if (not defined $conn) { die "Error sending http headers to client" };
                                $log->info("Child ${PID}: Response: ${http_response}");
                                my $fh;
                                $log->info("Child ${PID}: Opening file...");
                                open ($fh, "<:encoding(UTF-8)", $path) or die "Error opening file ${path}";
                                binmode($fh);
                                $log->info("Child ${PID}: File opened");
                                try {
                                    my $buffer = "";
                                    $log->info("Child ${PID}: Reading file and sending to client");
                                    while(read $fh, $buffer, $CHUNK) {
                                        $conn->send($buffer);
                                        if (not defined $conn) { die "Error while sending data to client" };
                                    }
                                    $log->info("Child ${PID}: Resource sent");
                                } catch {
                                    die "Child ${PID}: Error while reading from file. Error: $_";
                                };
                            } else {
                                $log->info("Child ${PID}: Path is neither a file nor dir");
                                send_response_403($conn);
                                return;
                            }
                    } else {
                        $log->info("Child ${PID}: Path is forbidden");
                        send_response_403($conn);
                        return;
                    }
                } else {
                    $log->info("Child ${PID}: File access denied, no read permission");
                    send_response_503($conn);
                    return;
                }
             } else {
                 $log->info("Child ${PID}: File ${path} doesn\'t exist");
                 send_response_404($conn);
                 return
             }
            
        } else {
            $log->info("Child ${PID}: Request method is unsupported: ${method}");
            send_response_501($conn);
            return;
        }
    
    } catch {
        $log->error("Child ${PID}: Error while processing GET request. Error: $_");
        send_response_500($conn);
        return;
    };
    $log->info("Child ${PID}: Exiting handle_request");
    return 1;
}

sub send_response_400 {
    my $conn = shift;
    my $http_response = "HTTP/1.1 400 Bad Request${CLRF}Content-Type: text\\plain${CLRF}${CLRF}Error 400 Bad Request";
    $conn->send($http_response);
    if (not defined $conn) { die "Error while sending response to client" };
}

sub send_response_403 {
    my $conn = shift;
    my $http_response = "HTTP/1.1 403 Forbidden${CLRF}Content-Type: text\\plain${CLRF}${CLRF}Error 403 Forbidden";
    $conn->send($http_response);
    if (not defined $conn) { die "Error while sending response to client" };
}

sub send_response_404 {
    my $conn = shift;
    my $http_response = "HTTP/1.1 404 Not Found${CLRF}Content-Type: text\\plain${CLRF}${CLRF}Error 404 Resource Not Found";
    $conn->send($http_response);
    if (not defined $conn) { die "Error while sending response to client" };
}

sub send_response_408 {
    my $conn = shift;
    my $http_response = "HTTP/1.1 408 Request Timeout${CLRF}Content-Type: text\\plain${CLRF}${CLRF}Error 408 Timeout";
    $conn->send($http_response);
    if (not defined $conn) { die "Error while sending response to client" };
}

sub send_response_500 {
    my $conn = shift;
    my $http_response = "HTTP/1.1 500 Internal Server Error${CLRF}Content-Type: text\\plain${CLRF}${CLRF}Error 500 Internal Server Error";
    $conn->send($http_response);
    if (not defined $conn) { die "Error while sending response to client" };
}

sub send_response_501 {
    my $conn = shift;
    my $http_response = "HTTP/1.1 501 Not Implemented${CLRF}Content-Type: text\\plain${CLRF}${CLRF}Error 501 Not Implemented";
    $conn->send($http_response);
    if (not defined $conn) { die "Error while sending response to client" };
}

sub send_response_503 {
    my $conn = shift;
    my $http_response = "HTTP/1.1 503 Service Unavailable${CLRF}Content-Type: text\\plain${CLRF}${CLRF}Error 503 Service Unavailable";
    $conn->send($http_response);
    if (not defined $conn) { die "Error while sending response to client" };
}
