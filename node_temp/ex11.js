var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res) {
    res.writeHead(200, {'content-type': 'text/plain'});
    fs.createReadStream(process.argv[3]).pipe(res);
    //~ const readStr = fs.createReadStream(process.argv[3]);
    //~ readStr.on('readable', () => {
        //~ var data = readStr.read();
        //~ if (data !== null) {
            //~ res.write(data);
        //~ }
    //~ });
    
    //~ readStr.on('end', () => {
      //~ res.end();
    //~ });
});

server.listen(process.argv[2]);
