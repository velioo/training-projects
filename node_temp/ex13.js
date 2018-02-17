var http = require('http');
var urlParser = require('url');

var server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    var urlProperties = urlParser.parse(req.url)

    if (urlProperties["pathname"] === "/api/parsetime") {
        var queryStr = urlProperties["query"];
        if (queryStr.indexOf("&") != -1) {
            queryStr = queryStr.split("&", 1);
        }
        var queryArg = queryStr.split("=").slice(-1);

        var res_date = new Date(queryArg);
        res.write(JSON.stringify({ "hour": res_date.getHours(), "minute": res_date.getMinutes(), "second": res_date.getSeconds() }))

    } else if (urlProperties["pathname"] === "/api/unixtime") {
        var queryStr = urlProperties["query"];
        if (queryStr.indexOf("&") != -1) {
            queryStr = queryStr.split("&", 1);
        }
        var queryArg = queryStr.split("=").slice(-1);
        var res_date = new Date(queryArg);
        res.write(JSON.stringify({"unixtime": res_date.getTime(queryArg)}));
    }

    res.end();
});

server.listen(process.argv[2]);
