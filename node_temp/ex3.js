var fs = require('fs');

var contents = fs.readFileSync(process.argv[2]).toString();
var new_lines = (contents.match(/\n/g) || []).length
console.log(new_lines);
