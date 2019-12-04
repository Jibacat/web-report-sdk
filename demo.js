
var http = require('http');
var fs = require('fs');
var server = http.createServer();
var port = 9888;

server.listen(port, function(){
     console.log('server is running at port：' + port);
});

server.on('request', function(req, res){
    var url = req.url;
    if(url ==='/'){
        res.writeHead(200, {'Content-Type': 'text/html'})
        fs.readFile('./demo.html', 'utf-8', function(err, data) {
            if(err){
                throw err ;
            }
            res.end(data);
        });
    } else if(url.indexOf('subao-sdk') >= 0) {
        res.writeHead(200, {'Content-Type': 'text/html'})
        fs.readFile('./dist/subao-sdk-1.0.13.min.js', 'utf-8', function(err, data) {
            if(err){
                throw err ;
            }
            res.end(data);
        });
    } else if(url.indexOf('/static') >= 0){
        res.writeHead(404)
        res.end();
    } else if(url === '/report') {
        req.on('data', function (data) {
            console.log('report data: ', JSON.parse(data.toString()))
            console.log('====================================================================')
         });
         res.writeHead(200)
         res.end('ok');
    } else {
        res.writeHead(404)
        res.end();
    }
});
