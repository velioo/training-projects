var http = require("http");

http.get(process.argv[2], onResponse).on('error', console.error);

function onResponse(response) {
    response.setEncoding("utf-8");
    response.on("data", console.log)
    response.on("error", console.error)
}
