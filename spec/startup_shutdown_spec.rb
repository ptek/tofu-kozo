# coding: utf-8

describe "Starting phantom.js with tofu-kozo" do
  before :all do
    @kozo_port = 10530
    @kozo = fork { exec "phantomjs ./src/tofu-kozo.js #{@kozo_port}" }
    Process.detach @kozo
    sleep 1
  end

  it "Can be launched" do
    lambda{Process.getpgid(@kozo)}.should_not raise_error
  end

  after :all do
    Process.kill("KILL", @kozo)
  end

end


describe "Stopping tofu-kozo" do
  before :all do
    @kozo_port = 10530
    @kozo = fork { exec "phantomjs ./src/tofu-kozo.js #{@kozo_port}" }
    Process.detach @kozo
    sleep 1
  end

  it "Can be stopped via HTTP call to /quit" do
    response = `curl -sS http://localhost:#{@kozo_port}/quit`
    sleep 0.5
    response.should == "Quitting.\n"
    lambda{Process.getpgid(@kozo)}.should raise_error
  end

end
