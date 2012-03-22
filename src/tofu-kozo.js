/* 
 TOFU-KOZO 豆腐小僧 
 An HTTP-based control scheme for phantom.js
 Licensed under the BSD license (see: LICENSE)
 Underscore.js licensed under the MIT license (see ./lib/_.js)
 
 * Action API: *
 
 URL                                   ACTION                 
 =========                             ==========             
 '/quit'                               Shut down phantom.js   
 '/visit?url=<URL-ENCODED ADDRESS>'    Visit the page         
 
*/


var fs = require('fs');
var server = require('webserver').create();
var logfile = "./phantom.log";
var port = phantom.args[0] || 10530;

var Code = {
  err : 254,
  quit : 253,
  ok : 250
}

var log = function(x) {
  var d = (new Date()).toISOString();
  var msg = JSON.stringify(x, null, 4);
  fs.write(logfile, (d + " : " + msg + "\n"), "a");
};

var makeResult = function(code, msg) {
  switch (code) {
  case Code.err : {
    return [code, {actionStatus : "error",
                   message: msg}];
  }
  case Code.ok : {
    return [code, {actionStatus : "ok"}];
  }
  case Code.quit : {
    return [code, {actionStatus : "quit"}];
  }
  default:
    return [code, {actionStatus : "unknown -- bug creator"}];
  }
};

var parseUrl = function(url) {
  if (/^\/quit$/.test(url)) {
    phantom.exit();
    return makeResult(Code.quit);
  } else if (/^\/visit\?url=(.*)/.test(url)) {
    var target = decodeURIComponent(url.split("=")[1]);
    return makeResult(Code.err,"Could not open page: "+target);
  } else {
    return makeResult(Code.ok);
  }
};

var loadDeps = function() {
  phantom.libraryPath = phantom.libraryPath+"/lib";
  phantom.injectJs("_.js");
}

var startServer = function() {
  var listening = server.listen(port, function(req, resp){
    var parseResult = parseUrl(req.url);
    resp.statusCode = parseResult[0];
    resp.write(JSON.stringify(parseResult[1]));
  });

  if (!listening) {
    console.log("Quitting web server on port " + port);
    phantom.exit();
  }
};

loadDeps();
startServer();