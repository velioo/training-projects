var fs = require('fs');

fs.readdir(process.argv[2], callback);

function callback(err, contents) {
    if (err) return console.error(err);
    contents.forEach(function(file) {
        if(file.endsWith('.' + process.argv[3])) {
            console.log(file);
        }
    })
}
