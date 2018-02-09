var bl = require('bl');
var http = require('http');
var urls = process.argv.slice(2)
var responses = [];
var count = 0;

urls.forEach(function(dummy, index) {
    readResponse(index);
})

function readResponse(index) {
    http.get(urls[index], function(response) {
        response.setEncoding("utf-8");
        response.pipe(bl(function(err, data) {
            if (err) return console.error(err);
            responses[index] = data.toString();
            count++;
            
            if(count == 3) {
                responses.forEach(function(response) {console.log(response);})
            }
            
        }))
        response.on("error", console.error)
        
    }).on('error', console.error);
}
