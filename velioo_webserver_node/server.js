const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const myFormat = printf(info => {
    return `${new Date(info.timestamp).toLocaleString()} ${info.level}: ${info.message}`
});

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        new transports.File({ filename: './logs/server.log' })
    ],
    exceptionHandlers: [
        new transports.File({ filename: './logs/exceptions.log' })
    ]
});
const http = require("http");
const urlParser = require('url');
const fs = require('fs');
const PORT = process.argv[2] || 8885;
const HOST = '127.0.0.1';
const BACKLOG = 10000;
const REQ_TIMEOUT = 1;
const ALLOWED_DIRS = ['./application'];
Object.freeze(ALLOWED_DIRS);

startServer();

function startServer() {
        
    try {
        logger.info("Creating server... ");
        const server = http.createServer(onRequest);
        logger.info("Starting to listen for connections...");
        server.on('error', (err) => {
           if(err.code === 'EADDRINUSE') {
               logger.error("Port in use. Retrying...");
               setTimeout(() => {
                    server.close();
                    server.listen(PORT, HOST);
                    logger.info("Listening on port " + PORT);
               }, 1000);
           }
           return logger.error("Error while starting listen function.\n" + err);
        });
        server.listen(PORT, HOST, BACKLOG);
        logger.info("Listening on port " + PORT);
        server.on('clientError', (err, socket) => {
          logger.error("Client error occurred. Sending error 400 Bad Request...");
          socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        });
        
        function onRequest(req, res) {
           try {
               var query = urlParser.parse(req.url);
               if (req.method === 'GET') {
                   logger.info("Request is GET");
                   logger.info("Path is: " + query.pathname);
                   var path = '.' + query.pathname;
                   fs.stat(path, function(err, stats) {
                       try {
                            if(err == null) {
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
                                        try {
                                            path = path + '/index.html';
                                        } catch (exc) {
                                            logger.error("Error while concatenating index page");
                                            sendResponse500(res);
                                            return;
                                        }
                                        
                                    }     
                                        
                                    try {                           
                                        fs.createReadStream(path).pipe(res);
                                    } catch (exc) {
                                        logger.error("Error while streaming resource to client: " + exc);
                                        sendResponse500(res);
                                    }
                                    return;
                                } else {
                                    logger.info("Path is forbidden");
                                    sendResponse403(res);
                                    return;
                                }
                            } else if (err.code == 'ENOENT') {
                                logger.info("Path doesn't exist");
                                sendResponse404(res);
                                return;
                            } else {
                                pathExists = null;
                                return;
                            }
                        } catch (exc) {
                            logger.error("Error while checking path existence: " + exc);
                            return;
                        }
                   });
                   
               } else {
                   sendResponse501(res, 'Request method is not Implemented\n');
                   return;
               }
               
           } catch (exc) {
              sendResponse500();
              return logger.error("Exception occured: " + exc);
           }
        }
        
        function sendResponse403(res) {
            res.writeHead(403, {"Content-Type": "text/plain"});
            res.end("Error 403: Forbidden\n");
        }
        
        function sendResponse404(res) {
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.end("Error 404: Not Found\n");
        }
        
        function sendResponse500(res) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            res.end("Error 500: Internal Server Error\n");
        }
        
        function sendResponse501(res, message) {
            res.writeHead(501, {"Content-Type": "text/plain"});
            res.end("Error 500:" + message + "\n");
        }
        
    } catch (exc) {
        logger.error("An exception occurred: " + exception + "\nRestarting server...");
        return startServer();
    }

}




