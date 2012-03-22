# coding: utf-8
require 'asdf'
require './spec/spec_tools'
include SpecTools

describe "Tofu-kozo error page: " do
  before :each do
    @kozo_port = 10530
    @kozo = fork { exec "phantomjs ./src/tofu-kozo.js #{@kozo_port}" }
    Process.detach @kozo
    sleep 0.5
  end
  
  after :each do 
    Process.kill "KILL", @kozo
  end

  it "Responds with an error message that the page could not be loaded." do
    url = "http://thisIsSuchALongUrlThatThisHostCannotPossiblyExist.com:9999/nonExistent.html"
    token = `curl -sS http://localhost:#{@kozo_port}/visit?url=#{e url}`
    (interpret_result (result_file token)).should == (error_msg "Could not open page: #{url}")
  end

end
