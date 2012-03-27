/* 
 TOFU-KOZO 豆腐小僧 
 An HTTP-based control scheme for phantom.js
 Licensed under the BSD license (see: LICENSE)
 Copyright 2012 pzel

 Includes jQuery, licensed under the BSD license.

*/

var fs = require('fs');
var page = require('webpage').create();
var server = require('webserver').create();
var logfile = "./phantom.log";
var port = phantom.args[0] || 10530;
var MAX_TICKS = 7;

page.onConsoleMessage = function(msg, line, id) { 
  log(msg+" (line: "+line+") : "+id); 
};

page.getContent = function() {
  // the standard phantom functions gets only the source(?) 
  page.injectJs("jquery_noConflict.js");
  var res = page.evaluate(function(){
    return jQuery("html").html();
  });
  return res;
};

var makeParams = function(jobToken, obj){
  var injection = ("window.TofuParams = {}; window.TofuParams ="+JSON.stringify(obj)+";");
  return writeInjection(jobToken, injection);
};

var clickElement = function(jobToken, selector) {
  var sel = selector.replace(/\+/g," ");
  page.injectJs("jquery_noConflict.js");
  page.injectJs(makeParams(jobToken,{selector:sel}));
  
  var res = page.evaluate(function(){
    return jQuery(TofuParams.selector).offset();
  });

  if (res.length !== 0) {
    var old = page.getContent();
    page.sendEvent("click", res.left, res.top);
    return waitForResult(jobToken, old, MAX_TICKS); // start countdown
  } else {
    return writeResult(jobToken, makeResult("error", "Could not find "+sel));
  }
};

var waitForResult = function(jobToken, oldPageBody, ticks) {
  if (ticks <= 0) {
    return writeResult(jobToken, makeResult("error", "Timed out for "+jobToken));
  } else if (page.getContent() !== oldPageBody) {
    return writeResult(jobToken, makeResult("ok", page.getContent()));
  } else {
    setTimeout(function(){waitForResult(jobToken, oldPageBody, (ticks-1))}, 500);
  }
};

var selectElement = function(jobToken, selector) {
  var sel = selector.replace("+"," ");
  page.injectJs("jquery_noConflict.js");
  page.injectJs(makeParams(jobToken,{selector:sel}));

  var res = page.evaluate(function() {
    var elems = jQuery(TofuParams.selector);
    if (elems.length > 0){
      return elems[0].outerHTML;
    }
    else
      return false;
  });

  if (typeof res === "string" && res.length !== 0) {
    return writeResult(jobToken, makeResult("ok", res));
  } else {
    return writeResult(jobToken, makeResult("error", "Could not find "+sel));
  }
};

var visitPage = function(jobToken, url) {
  page.open(url, function(status) {
    if (status === "fail") {
      return writeResult(jobToken, makeResult("error","Could not open page: "+url));
    } else if (status === "success") {
      return writeResult(jobToken, makeResult("ok", page.getContent()));
    }
  });
};

var fillInElement = function(jobToken, target, text) {
  var sel  = target.replace("+"," ");
  var t = text.replace("+"," ");  // TODO: remove this mechanism.


  page.injectJs("jquery_noConflict.js");
  page.injectJs(makeParams(jobToken,{selector:sel, text:t}));

  var res = page.evaluate(function() {
    var elems = jQuery(TofuParams.selector);
    if (elems.length > 0){
      elems[0].value = TofuParams.text;
      return(elems[0].value);
    } else {
      return false;
    }
  });

  if (typeof res === "string" && res.length !== 0) {
    return writeResult(jobToken, makeResult("ok", res));
  } else {
    return writeResult(jobToken, makeResult("error", "Could not find "+sel));
  }

};

var unknownCommand = function(jobToken, url) {
  var s = decodeURIComponent(url);
  return writeResult(jobToken, makeResult("error", "Could not interpret command: "+s));
};

var takeAction = function(jobToken, url) {
  if (/^\/quit$/.test(url)) {
    return setTimeout(phantom.exit, 1);
  } else if (/^\/visit\?url=(.*)/.test(url)) {
    var target = decodeURIComponent(url.split("=")[1]);
    return visitPage(jobToken, target);
  } else if (/^\/select\?sel=(.*)/.test(url)) {
    var target = decodeURIComponent(url.split("=")[1]);
    return selectElement(jobToken, target);
  } else if (/^\/click\?sel=(.*)/.test(url)) {
    var target = decodeURIComponent(url.split("=")[1]);
    return clickElement(jobToken, target);
  } else if (/^\/fill_in\?sel=(.*)&with\=(.*)/.test(url)) {
    var m = /^\/fill_in\?sel=(.*)&with\=(.*)/.exec(url);
    var target = decodeURIComponent(m[1]);
    var text = decodeURIComponent(m[2]);
    return fillInElement(jobToken, target, text);
  } else {
    return unknownCommand(jobToken, url);
  }
};

var startServer = function() {
  var listening = server.listen(port, function(req, resp){
    var jobToken = uuid();
    // Send the token to the client and the rest is callbacks
    resp.write(jobToken); 
    touchResultFile(jobToken);
    log(req.url);
    return takeAction(jobToken, req.url);
  });
  if (!listening) {
    console.log("Cannon open web server on port " + port);
    phantom.exit();
  }
};

var loadDeps = function() {
  phantom.injectJs("fileIO.js");
};

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
