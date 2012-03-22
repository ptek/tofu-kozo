# coding: utf-8
require 'asdf'
require 'cgi'

describe "Tofu-kozo error page: " do
  before :each do
    @kozo_port = 10530
    @kozo = fork { exec "phantomjs ./src/tofu-kozo.js #{@kozo_port}" }
    @www_server = fork { (Dir.chdir "./test_files") && (Asdf::Server.start) }
    @www_port = 9292 # Can this be parametrized?
    [@kozo, @www_server].each { |pid| Process.detach pid }
    sleep 0.5
  end
  
  after :each do 
    [@kozo, @www_server].each { |pid| Process.kill "KILL", pid }
  end

  it "Responds with an error message that the page could not be loaded." do
    url = "http://localhost:#{@www_port}/nonExistent.html"
    esc_url = CGI.escape url
    res = `curl -sS http://localhost:#{@kozo_port}/visit?url=#{esc_url}`
    res.should == (error_message "Could not open page: #{url}")
  end

  def error_message text
    "<html><body>Your tofu has gone bad:<br><span id='error-message'>#{text}</span></body></html>"
  end

end
