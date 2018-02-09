var fs = require('fs');
var contents = fs.readFile(process.argv[2], 'utf8',  
function parseContents(err, fileContents) {
    if (err) return console.error(err);
    var new_lines = fileContents.split("\n").length - 1;
    console.log(new_lines);
});
