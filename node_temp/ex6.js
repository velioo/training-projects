var mymodule = require('./dir_read.js');

mymodule(process.argv[2], process.argv[3],callback);

function callback(err, files) {
    if (err) return console.error('An error occurred: ' + err);
    files.forEach(function(file) {
        console.log(file);
    })
}
