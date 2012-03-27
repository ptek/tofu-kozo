# coding: utf-8
require './spec/spec_tools'
include SpecTools

describe "Tofu-kozo action API " do

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

  it "[ /vist?url=<url> ] returns the entire page body." do
    page_body = File.read("./test_files/index.html").strip.to_s
    html = inner_html page_body
    url = "http://localhost:#{@www_port}/index.html"
    token = `curl -s http://localhost:#{@kozo_port}/visit?url=#{e url}`
    (interpret_result token).should  == (ok_msg html)
  end

  describe "[ /select?sel=<CSS selector> ]" do
    
    it "selects by id and returns the HTML" do
      url = "http://localhost:#{@www_port}/selector_test.html"
      sel = "#test1-id"
      discard_result `curl -s http://localhost:#{@kozo_port}/visit?url=#{e url}`
      token = `curl -s http://localhost:#{@kozo_port}/select?sel=#{e sel}`
      (interpret_result token).should == 
        (ok_msg "<div id=\"test1-id\">Test me.</div>")
    end
    
    it "selects by class and returns the first matching element's HTML" do
      url = "http://localhost:#{@www_port}/selector_test.html"
      sel = ".testClass"
      discard_result `curl -s http://localhost:#{@kozo_port}/visit?url=#{e url}`
      token = `curl -s http://localhost:#{@kozo_port}/select?sel=#{e sel}`
      (interpret_result token).should == 
        (ok_msg "<div class=\"testClass\">First!</div>")
    end
    
    it "supports the :eq pseudoselector" do
      url = "http://localhost:#{@www_port}/selector_test.html"
      sel = ".testClass:eq(1)"
      discard_result `curl -s http://localhost:#{@kozo_port}/visit?url=#{e url}`
      
      token = `curl -s http://localhost:#{@kozo_port}/select?sel=#{e sel}`
      (interpret_result token).should == 
        (ok_msg "<div class=\"testClass\">Second!</div>")
    end
    
  end

  describe "/click?sel=<selector> by link text" do

    it "finds and clicks by link text" do
      index_body = File.read("./test_files/index.html").strip.to_s
      html = inner_html index_body
      url = "http://localhost:#{@www_port}/click_test.html"
      sel = 'a:contains(back to index)'
      discard_result `curl -s http://localhost:#{@kozo_port}/visit?url=#{e url}`
      token = `curl -s http://localhost:#{@kozo_port}/click?sel=#{e sel}`
      (interpret_result token).should == (ok_msg html)
    end

  end

  describe "/fill_in?sel=<selector>&with=<text>" do
    
    it "finds and clicks by link text" do
      url = "http://localhost:#{@www_port}/input_test.html"
      sel = '#input2-id'
      button_sel = '#submit-button'
      string = "こんにちは、世界"
      discard_result `curl -s http://localhost:#{@kozo_port}/visit?url=#{e url}`
      discard_result `curl -s http://localhost:#{@kozo_port}/fill_in?sel=#{e sel}\\&with=#{e string}`
      token = `curl -s http://localhost:#{@kozo_port}/click?sel=#{e button_sel}`
      interpret_result(token)["content"].to_s.should include "<div id=\"post-results\"><br><br>#{string}</div>"

    end

  end

  
  


end
