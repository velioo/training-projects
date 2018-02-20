const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const myFormat = printf(info => {
    return `${new Date(info.timestamp).toLocaleString()} ${info.level}: ${info.message}`
});

const logger = createLogger({
    level: 'error',
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        new transports.File({ filename: './logs/server.log' })
    ],
    exceptionHandlers: [
        new transports.File({ filename: './logs/exceptions.log' })
    ],
    exitOnError: false
});
const net = require('net');
const urlParser = require('url');
const fs = require('fs');
const PORT = +process.argv[2] || 8885;
const HOST = '127.0.0.1';
const BACKLOG = 10000;
const CLIENT_TIMEOUT = 10000;
const WRITE_TIMEOUT = 30000;
const ALLOWED_DIRS = ['./application'];
const domain = require('domain');
const serverDomain = domain.create();
const mime = require('mime');
Object.freeze(ALLOWED_DIRS);

serverDomain.on('error', (err) => {
    logger.error("Uncaught error occurred: " + err.stack);
});

serverDomain.run( () => {
logger.info("Creating server... ");
const server = net.createServer({"allowHalfOpen": true}, (conn) => {
    try {
        conn.setEncoding('utf8');
        var req_headers = "";
        var method = "";
        var path = "";
        var headersReceived = false;
        var hasTimedOut = false;
        var globalTimer = setTimeout(() => {
            if (hasTimedOut) return;
            logger.info("Client timed out, too much time to process request. Closing connection...");
            sendResponse408();
        }, CLIENT_TIMEOUT);
        conn.setTimeout(CLIENT_TIMEOUT);
        try {
            conn.on('data', (data) => {
                conn.setTimeout(0);
                logger.info("Data event:\n" + data);
                try {
                    if (!headersReceived) {
                        req_headers+=data;
                        if ((req_headers.indexOf("\r\n") != -1) && !method) {
                            var temp = req_headers.split(" ", 2);
                            method = temp[0];
                            path = temp[1];
                        }
                        if (req_headers.indexOf("\r\n\r\n") != -1 && !headersReceived) {
                            req_headers+=data.split("\r\n\r\n", 1)[0];
                            headersReceived = true;
                            clearTimeout(globalTimer);
                            logger.info("Client headers received.Continuing to request process");
                            return processRequest(req_headers, path, method);
                        }
                    }
                } catch (exc) {
                    logger.error("Error while concatenating client data: " + exc.stack);
                }
                conn.setTimeout(CLIENT_TIMEOUT);
            });
            conn.on('end', () => {
                logger.info("Client sent a FIN packet");
                conn.end();
            });
            conn.on('error', (err) => {
                if (err.code === 'ERR_STREAM_WRITE_AFTER_END') {
                    logger.error("Client socket was closed, cannot write to it");
                } else {
                    logger.error("Client socket error: " + err.stack);
                }
                conn.destroy();
            });
            conn.on('close', (had_error) => {
                if (had_error) {
                    return logger.error("Client socket closed due to a transmission error");
                }
                return logger.info("Client socket has fully closed");
            });
            conn.on('timeout', () => {
                if (hasTimedOut) return;
                logger.info("Client timed out. Closing connection...");
                sendResponse408();
            });
        } catch (exc) {
            sendResponse500();
            return logger.error("Exception occured: " + exc.stack);
        }
            
        function processRequest(req_headers, path, method) {
            logger.info("Method: " + method + ", Path: " + path);
            try {
                logger.info("processRequest invoked");
                var query = urlParser.parse(path);
                if (method === 'GET') {
                    logger.info("Request is GET");
                    logger.info("Path is: " + query.pathname);
                    var path = '.' + query.pathname;
                    checkIfPathExists(processPath);
                } else {
                    sendResponse501('Request method is not Implemented\n');
                    return;
                }
                
                function checkIfPathExists(callback1) {
                    fs.stat(path, function(err, stats) {
                        if (err === null) {
                            callback1(true, stats);
                        } else if (err.code == 'ENOENT') {
                            callback1(false, stats);
                        } else {
                            logger.error("Stat returned error: " + err);
                            return sendResponse500(conn);
                        }
                    });
                }
                
                function processPath(pathExists, stats) {
                    if (pathExists) {
                        var pathIsAllowed = false;
                        logger.info("Path exists");
                        logger.info("Checking if path is allowed...");
                        for(var i = 0; i < ALLOWED_DIRS.length; i++) {
                            if(path.startsWith(ALLOWED_DIRS[i])) {
                                pathIsAllowed = true;
                                break;
                            }
                        };
                        if(pathIsAllowed && (stats.isDirectory() || stats.isFile())) {
                            logger.info("Path is allowed");
                            if(stats.isDirectory()) {
                                logger.info("Path is a directory. Concatenating index.html to path");
                                try {
                                    path = path + '/index.html';
                                    return checkIfPathExists(prepareToSendResource, null);
                                } catch (exc) {
                                    logger.error("Error while concatenating index page");
                                    sendResponse500();
                                    return;
                                }
                            }
                            logger.info("Path is a file");
                            prepareToSendResource(true, stats);
                        } else {
                            logger.info("Path is forbidden");
                            sendResponse403();
                            return;
                        }
                    } else {
                        logger.info("Path doesn't exist");
                        sendResponse404();
                        return;
                    }
                }
                
                function prepareToSendResource(pathExists, stats) {
                    if (pathExists) {
                        var contentType = mime.getType(path);
                        logger.info("Sending headers to client...");
                        if (!hasTimedOut) {
                            conn.write("HTTP/1.1 200 OK\r\nContent-Type: " + contentType + "\r\nContent-Length: " + stats.size  + "\r\n\r\n", sendResource);
                        } else {
                            logger.info("Client alredy timed out, suspending request processing");
                        }
                    } else {
                        logger.info("Path is forbidden, index.html might be missing");
                        sendResponse403(conn);
                    }
                }
                
                function sendResource() {
                    const stream_in = fs.createReadStream(path);
                    var writeTimeout;
                    
                    stream_in.on('error', (err) => {
                        logger.error("Error while piping resource to client: " + err.stack); 
                        if (err.code === 'ENOENT') {
                            return sendResponse403();
                        }
                        sendResponse500(); 
                    });
                    
                    writeTimeout = setTimeout(() => {
                        logger.info("Timeout while writing to client");
                        sendResponse408();
                    }, WRITE_TIMEOUT);
                    
                    stream_in.on('end', (err) => {
                        logger.info("Resource has been sent to client");
                        clearTimeout(writeTimeout);
                        conn.end();
                    });
                    
                    logger.info("Sending resource to client...");
                    if (!hasTimedOut) {
                        stream_in.pipe(conn);
                    } else {
                        logger.info("Client alredy timed out, suspending request processing");
                    }
                }
                
            } catch (exc) {
                logger.error("Exception in processRequest: " + exc.stack);
            }
        }
       
        function sendResponse403() {
            conn.end("HTTP/1.1 403 Forbidden\r\nContent-Type:text/plain\r\n\r\nError 403: Forbidden\n");
        }

        function sendResponse404() {
            conn.end("HTTP/1.1 404 Not Found\r\nContent-Type:text/plain\r\n\r\nError 404: Not Found\n");
        }
        
        function sendResponse408() {
            if (hasTimedOut) return;
            hasTimedOut = true;
            conn.end("HTTP/1.1 408 Request Timeout\r\nContent-Type:text/plain\r\n\r\nError 408: Request Timeout\n");
        }

        function sendResponse500() {
            conn.end("HTTP/1.1 500 Internal Server Error\r\nContent-Type:text/plain\r\n\r\nError 500: Internal Server Error\n");
        }

        function sendResponse501(message) {
            conn.end("HTTP/1.1 501 Not Implemented\r\nContent-Type:text/plain\r\n\r\nError 501:" + message + "\n");
        }
    } catch (exc) {
        logger.error("Error while processing request: " + exc.stack);
    }
});

server.on('error', (err) => {
   if(err.code === 'EADDRINUSE') {
       logger.error("Port in use. Retrying...");
       setTimeout(() => {
            server.close();
            server.listen(PORT, HOST);
            logger.info("Listening on port " + PORT);
       }, 1000);
   }
   return logger.error("Error while starting listen function.\n" + err.stack);
});

server.listen(PORT, HOST, BACKLOG, () => {
    logger.info("Server bound to port: " + PORT);
});

});
