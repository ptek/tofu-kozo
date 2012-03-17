var server = require('webserver').create();
var fs = require('fs');
var logfile = "./phantom.log";
var port;

port = phantom.args[0] || 10530;

var clearLog = function(){
  fs.write(logfile, "\n", "w");
};

var log = function(x){
  var d = (new Date()).toISOString();
  var msg = JSON.stringify(x, null, 4);
  fs.write(logfile, (d + " : " + msg + "\n"), "a");
};

var parseUrl = function(url){
  if (/\/quit$/.test(url)) {
    log("quit! command received, shutting down");
    phantom.exit();
    return false
  } else {
    log("Got url: "+url);
    return true;
  }
};


var startServer = function() {
  var listening = server.listen(port, function(req, resp){
    var parseResult;
    parseResult = parseUrl(req.url);
    log('parsing finished');
    resp.statusCode = 200;
    resp.write("OK\n");
  });

  if (!listening) {
    console.log("Quitting web server on port " + port);
    phantom.exit();
  }
};

clearLog();
startServer();