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
var page = require('webpage').create();
var server = require('webserver').create();
var logfile = "./phantom.log";
var port = phantom.args[0] || 10530;

var makeResult = function(code, msg) {
  return JSON.stringify({actionStatus : code, content: msg});
};

var visitPage = function(jobToken, url) {
  page.open(url, function(status) {
    if (status === "fail") {
      return writeResult(jobToken, makeResult("error","Could not open page: "+url));
    } else if (status === "success") {
      return writeResult(jobToken, makeResult("ok", page.content));
    }
  });
};

var takeAction = function(jobToken, url) {
  if (/^\/quit$/.test(url)) {
    phantom.exit();
    return false;
  } else if (/^\/visit\?url=(.*)/.test(url)) {
    var target = decodeURIComponent(url.split("=")[1]);
    return visitPage(jobToken, target);
  } else {
    return writeResult(jobToken, makeResult("ok"));
  }
};

var startServer = function() {
  var listening = server.listen(port, function(req, resp){
    var jobToken = uuid();
    // Send the token to the client and the rest is callbacks
    resp.write(jobToken); 
    touchResultFile(jobToken);
    return takeAction(jobToken, req.url);
  });
  if (!listening) {
    console.log("Cannon open web server on port " + port);
    phantom.exit();
  }
};

var loadDeps = function() {
  phantom.libraryPath = phantom.libraryPath+"/lib";
  phantom.injectJs("_.js");
}

var prepareDir = function(port){
  if (fs.isWritable("/tmp")){
    fs.makeTree(resultDir()); 
    return true;
  }
  else {
    phantom.exit();
    return false;
  }
};

var resultDir = function(){
  return "/tmp/tofu-kozo/"+port+"/";
};

var resultFile = function(jobToken) {
  return resultDir()+jobToken;
};

var touchResultFile = function(jobToken) {
  return fs.touch(resultFile(jobToken));
};

var writeResult = function(jobToken, resultString) {
  return fs.write(resultFile(jobToken), resultString, "w");
};

var log = function(x) {
  var d = (new Date()).toISOString();
  var msg = JSON.stringify(x, null, 4);
  fs.write(logfile, (d + " : " + msg + "\n"), "a");
};

var uuid = function() {
  var uuid = "", i, random;
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;
    if (i == 8 || i == 12 || i == 16 || i == 20) {
      uuid += "-"
    }
    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
  }
  return uuid;
}

loadDeps();
prepareDir(port);
startServer();
