/* 
 TOFU-KOZO 豆腐小僧 
 An HTTP-based control scheme for phantom.js
 Licensed under the BSD license (see: LICENSE)
 Underscore.js licensed under the MIT license (see ./lib/_.js)

 This file contains port-dependent IO functions.

*/

if (fs === undefined){
  var fs = require('fs');
}
var tofuPort = port; // get port from main file;

var logfile = function() {
  return resultDir()+"tofu-kozo.log";
};

var log = function(x) {
  var d = (new Date()).toISOString();
  var msg = JSON.stringify(x, null, 4);
  fs.write(logfile(), (d + " : " + msg + "\n"), "a");
};

var makeResult = function(code, msg) {
  return JSON.stringify({actionStatus : code, content: msg});
};

var resultDir = function(){
  return "/tmp/tofu-kozo/"+tofuPort+"/";
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

var injectionFile = function(jobToken) {
  return resultFile(jobToken)+"-injection.js";
};

var writeInjection = function(jobToken, string) {
  var file = injectionFile(jobToken);
  fs.write(file, string, "w");
  return file;
};
      

