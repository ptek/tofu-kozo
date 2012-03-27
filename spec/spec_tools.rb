require 'asdf'
require 'cgi'
require 'json'

module SpecTools

  def run_server
    $stdout.reopen("/dev/null", "a")
    $stderr.reopen("/dev/null", "a")
    Dir.chdir "./test_files"
    Asdf::Server.start
  end

  def inner_html string
    string.gsub(/^<html>/,"").gsub(/<\/html>/,"")
  end

  def e url
    CGI.escape url
  end

  def error_msg text
    {"actionStatus" => "error", "content"=> text}
  end

  def ok_msg page_body
    {"actionStatus" => "ok", "content"=> page_body.gsub("\n", "")}
  end

  def result_path token
    tmp_dir + token
  end

  def tmp_dir 
    "/tmp/tofu-kozo/#{@kozo_port}/"
  end

  # just an alias for better readablitiy in tests
  def discard_result token
    interpret_result token
  end

  def interpret_result token, tries=5
    if tries < 0
      raise "Could not get result file for #{token}."
    end

    s = File.read(result_path token)
    if s.length == 0
      sleep 1
      return interpret_result(token, tries - 1)
    end

    dirty = JSON.parse s

    if dirty["content"]
      clean_content = dirty["content"].gsub("\n","")
    else
      clean_content = ""
    end
    
    { 
      "actionStatus" => dirty["actionStatus"],
      "content" => clean_content
    }

  end
end
  
