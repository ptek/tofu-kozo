# coding: utf-8
require './spec/spec_tools.rb'
include SpecTools

describe "Starting and stopping phantom.js with tofu-kozo" do
  before :each do
    @kozo_port = 10530
    @kozo = fork { exec "phantomjs ./src/tofu-kozo.js #{@kozo_port}" }
    Process.detach @kozo
    sleep 0.7
  end

  describe "startup" do
    after :each do
      Process.kill("KILL", @kozo)
    end

    it "Can be launched" do
      lambda{Process.getpgid(@kozo)}.should_not raise_error
    end
  end

  describe "shutdown" do
    it "Can be stopped via HTTP call to /quit" do
      `curl -sS http://localhost:#{@kozo_port}/quit`
      sleep 0.5
      lambda{Process.getpgid(@kozo)}.should raise_error
    end
  end
end
