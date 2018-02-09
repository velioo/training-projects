var net = require('net');
var server = net.createServer(function(socket) {
    
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1 > 9 ? today.getMonth() + 1 : "0" + (today.getMonth() + 1);
    var date = today.getDate() > 9 ? today.getDate() : "0" + today.getDate();
    var hours = today.getHours() > 9 ? today.getHours() : "0" + today.getHours();
    var minutes = today.getMinutes() > 9 ? today.getMinutes() : "0" + today.getMinutes();
    
    socket.end([year,month,date].join('-') + " " + hours + ":" + minutes + "\n");
    
});

server.listen(process.argv[2]);
