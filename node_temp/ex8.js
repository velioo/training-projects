var bl = require('bl');
var http = require('http');

http.get(process.argv[2], onResponse).on('error', console.error);

function onResponse(response) {
    response.setEncoding("utf-8");
    response.pipe(bl(function(err, data) {
        if (err) return console.error(err);
        console.log(data.toString().length);
        console.log(data.toString());
    }))
    response.on("error", console.error)
}
