# coding: utf-8
require './spec/spec_tools.rb'
include SpecTools
 
describe "shutdown" do
  before :each do
    @kozo_port = 10531
    @kozo = fork { exec "phantomjs ./src/tofu-kozo.js #{@kozo_port}" }
    Process.detach @kozo
    sleep 3
  end
  
  it "Can be stopped via HTTP call to /quit" do
    r = interpret_result `curl -sS http://localhost:#{@kozo_port}/quit`
    r.should == (ok_msg "Quitting")
    sleep 1
    pids = `ps aux | grep [p]hantom| awk '{print $2}'`
    pids.split("\n").should_not include (@kozo.to_s)

  end
end
