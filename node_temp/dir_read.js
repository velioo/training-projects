var fs = require('fs');
module.exports = function(dirName, ext, callback) {
    fs.readdir(dirName, 'utf8',
    function parseContents(err, files) {
        if (err) return callback(err);
        files = files.filter(function(file) {
           return file.endsWith('.' + ext) 
        });
        callback(null, files);
    });
}
