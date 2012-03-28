# coding: utf-8
require './spec/spec_tools.rb'
include SpecTools

describe "startup" do

  before :each do
    @kozo_port = 10531
    @kozo = fork { exec "phantomjs ./src/tofu-kozo.js #{@kozo_port}" }
    Process.detach @kozo
    sleep 3
  end

  after :each do
    Process.kill("KILL", @kozo)
      sleep 1
  end

  it "Can be launched" do
      `ps aux | grep [p]hantom| awk '{print $2}'`.should include @kozo.to_s
  end
end
