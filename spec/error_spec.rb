# coding: utf-8
require 'asdf'
require './spec/spec_tools'
include SpecTools

describe "Tofu-kozo error page: " do
  before :all do
    @kozo_port = 10530
    @kozo = fork { exec "phantomjs ./src/tofu-kozo.js #{@kozo_port}" }
    @www_server = fork { run_server }
    @www_port = 9292 # Can this be parametrized?
    [@kozo, @www_server].each { |pid| Process.detach pid }
    sleep 2
  end
  
  after :all do 
    [@kozo, @www_server].each { |pid| Process.kill "KILL", pid }
  end

  it "Responds with an error message that the page could not be loaded." do
    url = "http://thisIsSuchALongUrlThatThisHostCannotPossiblyExist.com:9999/nonExistent.html"
    token = `curl -sS http://localhost:#{@kozo_port}/visit?url=#{e url}`
    (interpret_result token).should == (error_msg "Could not open page: #{url}")
  end

  it "Responds with an error message if the command is malformed" do
    token = `curl -sS http://localhost:#{@kozo_port}/doStuff?tofu=#{e 'bogus:stuff'}`
    (interpret_result token).should == (error_msg "Could not interpret command: /doStuff?tofu=bogus:stuff")

  end
end
