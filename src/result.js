var makeResult = function(code, msg) {
  return JSON.stringify({actionStatus : code, content: msg});
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

