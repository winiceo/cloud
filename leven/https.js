var https = require('https');
var http = require('http');
var path = require('path');
var port = process.argv[2] || 8043;
 var fs = require('fs');
var checkip = require('check-ip-address');
var server;

//

//
// Serve an Express App securely with HTTPS
//
server = http.createServer();
checkip.getExternalIp().then(function (ip) {
  var host = ip || 'local.helloworld3000.com';

  function listen(app) {
    server.on('request', app);
    server.listen(port, function () {
      port = server.address().port;
      console.log('Listening on http://127.0.0.1:' + port);
      console.log('Listening on http://local.helloworld3000.com:' + port);
      if (ip) {
        console.log('Listening on http://' + ip + ':' + port);
      }
    });
  }

  var publicDir = path.join(__dirname, 'public');
  var app = require('./app').create(server, host, port, publicDir);
  listen(app);
});

