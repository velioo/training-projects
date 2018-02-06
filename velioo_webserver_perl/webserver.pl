#!/usr/bin/perl -w
use strict;
use warnings;
use Log::Log4perl;
use IO::Socket;
use IO::Select;
use Try::Tiny;
use English;
use Encode qw(decode encode);
Log::Log4perl::init_and_watch('config/log.conf',10);
#~ use lib "/home/velioo/training-projects/velioo_webserver_perl/lib";
#~ use web;

my $QUEUE_SIZE = 1000;
my $CHUNK = 4096;
my $CLRF = "\r\n";
my $log = Log::Log4perl->get_logger();

my $port = shift || 8886;
my $socket = IO::Socket::INET->new ( LocalPort => $port,
                                     Listen    => $QUEUE_SIZE,
                                     ReuseAddr => 1 )
                                     or die "Can't create listen socket: $!";
        
$log->info("Listening on port $port");
print "Listening on port $port\n";
while(my $conn = $socket->accept) {
    $log->info('Parent: New connection accepted');
    my $pid;
    try {
        $pid = fork();
    } catch {
        $log->error("Parent: Failed to create child copy") if not defined $pid;
        $log->error("Parent: Error: $_");
    };
    
    if (not $pid) {
        try {
            $log->info("Child ${PID}: Closing child copy");
            close $socket;
        } catch {
            $log->error("Child ${pid}: Problem closing child copy. Error: $_");
        };
        
        try {
            $log->info("Child ${PID}: invoking handle_connection");
            handle_connection($conn);
        } catch {
            $log->error("Child ${pid}: Problem while handling request. Error: $_");
        };
        
        try {
            $log->info("Child ${PID}: Closing connection");
            close $conn;
        } catch {
            $log->error("Child ${pid}: Problem closing connection. Error: $_");
        };
        
        exit;
    } else {
        try {
            $log->info("Parent: Closing parent copy");
            close $conn;
        } catch {
            $log->error("Problem closing parent connection copy. Error: $_");
        };
    }
}


sub handle_connection {
    $log->info("Child ${PID}: In handle connection");
    my $conn = shift;
    try {
        my $sel = new IO::Select($conn);
        my @ready;
        my $data;
        my $request_headers = "";
        my $request_body = "";
        my $method, my $path, my $protocol;
        while(1) {
            @ready = $sel->can_read(10);
            if (!scalar(@ready)) {
                $log->error("Child ${PID}: Client timed out");
                send_response_408($conn);
                last;
            }
            $conn->recv($data, $CHUNK);
            $log->info("Child ${PID}: Data read: ${data}");
            if (not $data) {
                $log->info("Child ${PID}: Client didn\'t send any data");
                last;
            }
            try {
                $request_headers.=$data;
            } catch {
                $log->error("Child ${PID}: Problem concatenating reqeust  Error: $_");
            };
            if (index($request_headers, $CLRF)) {
                $log->info("Child ${PID}: Req headers: $request_headers");
                try {
                    ($method, $path, $protocol) = split(/\s+/ , [split(/\n/, $request_headers, 2)]->[0]);
                } catch {
                    $log->error("Child ${PID}: Error while parsing request line. Error: $_");
                };
                $log->info("Child ${PID}: Method: " . $method . ", Path: " . $path . ", Protocol: " . $protocol);
            }
            if (index($request_headers, "\r\n\r\n")) {
                $log->info("Child ${PID}: New line found");
                try {
                    ($request_headers, $request_body) = [split(/\n\n/, $request_headers)];
                } catch {
                    $log->error("Child ${PID}: Error while splitting headers from boddy. Error: $_");
                }
                last;
            }
        }
    } catch {
        $log->error("Child ${PID}: Error while reading from client. Error: $_");
    };
    my $http_response = "HTTP/1.1 200 OK${CLRF}Content-Type: text\\plain${CLRF}${CLRF}Test Text";
    $conn->send($http_response);
    
    return 1
}


sub send_response_408 {
    my $conn = shift;
    my $http_response = "HTTP/1.1 408 Request Timeout${CLRF}Content-Type: text\\plain${CLRF}${CLRF}Timeout";
    try {
        $conn->send($http_response);
    } catch {
        $log->error("Child ${PID}: Problem while writing to client. Error: $_");
    };
}





