const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const myFormat = printf(info => {
    return `${new Date(info.timestamp).toLocaleString()} ${info.level}: ${info.message}`
});

const logger = createLogger({
    level: 'error',
    format: combine(
        format.splat(),
        timestamp(),
        myFormat
    ),
    transports: [
        new transports.File({ filename: './logs/server.log'})
    ],
    exceptionHandlers: [
        new transports.File({ filename: './logs/exceptions.log'})
    ],
    exitOnError: false
});
const { promisify } = require('util');
const net = require('net');
const urlParser = require('url');
const fs = require('fs');
const stat = promisify(fs.stat);
const PORT = +process.argv[2] || 8885;
const HOST = '127.0.0.1';
const BACKLOG = 65000;
const CLIENT_TIMEOUT = 10000;
const CLEAN_COUNT = 100;
const TIMER_TIME = 5000
const ALLOWED_DIRS = ['./application'];
const domain = require('domain');
const conns = [];
const serverDomain = domain.create();
const mime = require('mime');
Object.freeze(ALLOWED_DIRS);

serverDomain.on('error', (err) => {
    //logger.error("Uncaught error occurred: " + err.stack);
});

serverDomain.run(() => {
//logger.info("Creating server... ");
const server = net.createServer((conn) => {
    conn.timeout = Date.now() + CLIENT_TIMEOUT;
    conn.responseSent = false;
    conns.push(conn);
    try {
        conn.setEncoding('utf8');
        var req_headers = "";
        var method = "";
        var path = "";
        var headersReceived = false;
        try {
            conn.on('data', (data) => {
                if (conns.indexOf(conn) == -1) return;
                //logger.info("Data event:\n" + data);
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
                            //logger.info("Client headers received, continuing to request process");
                            return processRequest(conn, req_headers, path, method);
                        }
                    }
                } catch (exc) {
                    //logger.error("Error while concatenating client data: " + exc.stack);
                }
            });
            conn.on('end', () => {
                //logger.info("Client sent a FIN packet");
                var connIndex = conns.indexOf(conn);
                if (connIndex > -1) {
                    conns.splice(connIndex, 1);
                }
                conn.end();
            });
            conn.on('error', (err) => {
                if (err.code === 'ERR_STREAM_WRITE_AFTER_END') {
                    //logger.error("Client socket was closed, cannot write to it");
                } else {
                    //logger.error("Client socket error: " + err.stack);
                }
                conn.destroy();
            });
            conn.on('close', (had_error) => {
                if (had_error) {
                    return //logger.error("Client socket closed due to a transmission error");
                }
                //logger.info("Client socket has fully closed");
            });
        } catch (exc) {
            //logger.error("Exception while adding connection listeners: " + exc.stack);
            return sendResponse500(conn);
        }
            
        async function processRequest(conn, req_headers, path, method) {
            //logger.info("Method: " + method + ", Path: " + path);
            try {
                //logger.info("processRequest invoked");
                var query = urlParser.parse(path);
                if (method === 'GET') {
                    //logger.info("Request is GET");
                    //logger.info("Path is: " + query.pathname);
                    var path = '.' + query.pathname;
                    try {                      
                        var pathIsAllowed = false;
                        //logger.info("Checking if path is allowed...");
                        for(var i = 0; i < ALLOWED_DIRS.length; i++) {
                            if(path.startsWith(ALLOWED_DIRS[i])) {
                                pathIsAllowed = true;
                                break;
                            }
                        };
                        if (pathIsAllowed) {
                            //logger.info("Path is allowed");
                            var pathStats = await stat(path);
                            var contentType = mime.getType(path);
                            if (contentType === null) {
                                if (pathStats.isDirectory()) {
                                    //logger.info("Path is a directory. Concatenating index.html to path");
                                    try {
                                        path = path + '/index.html';
                                        pathStats = await stat(path);
                                    } catch (exc) {
                                        if (exc.code === 'ENOENT') {
                                            //logger.info("No index page in folder - path is forbidden");
                                            return sendResponse403(conn);
                                        } 
                                        //logger.error("Error while concatenating index page or getting path info: " + exc.stack);
                                        return sendResponse500(conn);
                                    }
                                    contentType = mime.getType(path)
                                } else {
                                    contentType = 'text/plain';
                                }
                            }
                            //logger.info("Sending headers to client...");
                            conn.write("HTTP/1.1 200 OK\r\nContent-Type: " + contentType + "\r\nContent-Length: " + pathStats.size  + "\r\n\r\n");
                            
                            const stream_in = fs.createReadStream(path);
                            stream_in.on('error', (err) => {
                                //logger.error("Error while piping resource to client: " + err.stack); 
                                if (err.code === 'ENOENT') {
                                    return sendResponse403(conn);
                                }
                                sendResponse500(conn); 
                            });
                            
                            stream_in.on('end', (err) => {
                                //logger.info("Resource has been sent to client");
                                conn.responseSent = true;
                                conn.end();
                            });
                            
                            //logger.info("Sending resource to client...");
                            stream_in.pipe(conn);
                            
                        } else {
                            pathExists = await stat(path);
                            //logger.info("Path is forbidden");
                            return sendResponse403(conn);
                        }
                    } catch (exc) {
                        if (exc.code == 'ENOENT') {
                            //logger.info("Path doesn't exist");
                            return sendResponse404(conn);
                        } 
                        //logger.error("Error while checking path existence: " + exc.stack);
                        return sendResponse500(conn);
                    }

                } else {
                    return sendResponse501(conn, 'Request method is not Implemented\n');
                }
            } catch (exc) {
                //logger.error("Exception in processRequest: " + exc.stack);
            }
        }
       
    } catch (exc) {
        //logger.error("Error while processing request: " + exc.stack);
    }
});

var globalTimer = setInterval(() => {
    ////logger.info("Timeout timer invoked");
    try {
    if (conns.length <= 0) return;
    //logger.info("Connections for potential cleaning available");
    var cleanCount = CLEAN_COUNT;
    if (conns.length < CLEAN_COUNT) cleanCount = conns.length;
    var currentTime = Date.now();
    for(var i = 0; i < cleanCount; i++) {
        if (conns[0].timeout > currentTime) break;
        //logger.info("Cleaning connection...");
        sendResponse408(conns.shift());
    };
    } catch (exc) {
        //logger.error("Exception in timeout timer: " + exc.stack);
    }
}, TIMER_TIME);

function sendResponse403(conn) {
    conn.end("HTTP/1.1 403 Forbidden\r\nContent-Type:text/plain\r\n\r\nError 403: Forbidden\n");
    conn.responseSent = true;
}

function sendResponse404(conn) {
    conn.end("HTTP/1.1 404 Not Found\r\nContent-Type:text/plain\r\n\r\nError 404: Not Found\n");
    conn.responseSent = true;
}

function sendResponse408(conn) {
    if (!conn.responseSent) conn.end("HTTP/1.1 408 Request Timeout\r\nContent-Type:text/plain\r\n\r\nError 408: Request Timeout\n");
    conn.destroy();
}

function sendResponse500(conn) {
    conn.end("HTTP/1.1 500 Internal Server Error\r\nContent-Type:text/plain\r\n\r\nError 500: Internal Server Error\n");
    conn.responseSent = true;
}

function sendResponse501(conn, message) {
    conn.end("HTTP/1.1 501 Not Implemented\r\nContent-Type:text/plain\r\n\r\nError 501:" + message + "\n");
    conn.responseSent = true;
}

server.on('error', (err) => {
   if(err.code === 'EADDRINUSE') {
       //logger.error("Port in use. Retrying...");
       setTimeout(() => {
            server.close();
            server.listen(PORT, HOST);
            //logger.info("Listening on port " + PORT);
       }, 1000);
   }
   return //logger.error("Error while starting listen function.\n" + err.stack);
});

server.listen(PORT, HOST, BACKLOG, () => {
    //logger.info("Server bound to port: " + PORT);
    console.log("Server running on port: " + PORT);
});

});
