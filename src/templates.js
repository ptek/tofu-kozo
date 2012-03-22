var errorTemplate = "<html><body>Your tofu has gone bad:<br><span id='error-message'>{{message}}</span></body></html>";

T = {
  errorPage : function(obj) {
    return (_.template(errorTemplate, obj));
  },
  quitPage : function(){
    return "Quitting.\n";
  },
  okPage : function() {
    return "OK.\n"
  }
} 