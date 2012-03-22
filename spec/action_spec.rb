# coding: utf-8
require './spec/spec_tools'
include SpecTools

describe "Tofu-kozo visits a page " do
  before :all do
    @kozo_port = 10530
    @kozo = fork { exec "phantomjs ./src/tofu-kozo.js #{@kozo_port}" }
    @www_server = fork { run_server }
    @www_port = 9292 # Can this be parametrized?
    [@kozo, @www_server].each { |pid| Process.detach pid }
    sleep 0.5
  end
  
  after :all do 
    [@kozo, @www_server].each { |pid| Process.kill "KILL", pid }
  end

  it "Responds with the page body after a visit" do
    page_body = File.read("./test_files/index.html").strip
    url = "http://localhost:#{@www_port}/index.html"
    token = `curl -s http://localhost:#{@kozo_port}/visit?url=#{e url}`
    (interpret_result (result_file token)).should == (ok_msg page_body)
  end



end
