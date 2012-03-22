/* 
 TOFU-KOZO 豆腐小僧 
 An HTTP-based control scheme for phantom.js
 Licensed under the BSD license (see: LICENSE)
 Underscore.js licensed under the MIT license (see ./lib/_.js)
 
 * Action API: *
 
 URL                                   ACTION                  RESPONSE BODY*
 =========                             ==========              ==============
 '/quit'                               Shut down phantom.js    "Quitting.\n"
 '/visit?url=<URL-ENCODED ADDRESS>'    Visit the page          Info
 

 *Info = Information about the action. 
         It does NOT contain any HTML from the page being viewed by kozo.

 * Status codes used by the server *
 250 = The command was successful
 253 = The server will shut down now
 254 = The command was unsuccessful, see response body for details
 
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

var makeResult = function(code, obj) {
  var body;
  switch (code) {
  case Code.err : {
    body = T.errorPage(obj);
    break;
  }
  case Code.ok : {
    body = T.okPage(obj);
    break;
  }
  case Code.quit : {
    body = T.quitPage();
    break;
  }
  default: body = "OK";
  }
  return { statusCode : code, 
           body : body }
};

var parseUrl = function(url) {
  if (/^\/quit$/.test(url)) {
    phantom.exit();
    return makeResult(Code.quit);
  } else if (/^\/visit\?url=(.*)/.test(url)) {
    var target = decodeURIComponent(url.split("=")[1]);
    log(target);
    return makeResult(Code.err, {message : "Could not open page: "+target});
  } else {
    return makeResult(Code.ok);
  }
};

var loadDeps = function() {
  phantom.injectJs("templates.js");
  phantom.libraryPath = phantom.libraryPath+"/lib";
  phantom.injectJs("_.js");
  
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
  };
}

var startServer = function() {
  var listening = server.listen(port, function(req, resp){
    var parseResult = parseUrl(req.url);
    resp.statusCode = parseResult.statusCode;
    resp.write(parseResult.body);
  });

  if (!listening) {
    console.log("Quitting web server on port " + port);
    phantom.exit();
  }
};

loadDeps();
startServer();