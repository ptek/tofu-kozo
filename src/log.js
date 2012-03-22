var log = function(x) {
  var d = (new Date()).toISOString();
  var msg = JSON.stringify(x, null, 4);
  fs.write(logfile, (d + " : " + msg + "\n"), "a");
};
