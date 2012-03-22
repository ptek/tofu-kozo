require 'asdf'
require 'cgi'
require 'json'

module SpecTools

  def run_server
    $stdout = File.open("/dev/null", "a")
    $stderr= $stdout
    (Dir.chdir "./test_files") && (Asdf::Server.start) 
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

  def result_file token
    tmp_dir + token
  end

  def tmp_dir 
    "/tmp/tofu-kozo/#{@kozo_port}/"
  end

  def interpret_result file_path
    s = File.read file_path
    if s.length == 0
      sleep 1
      return interpret_result file_path
    end

    dirty = JSON.parse s
    clean_content = dirty["content"].gsub("\n","")
    
    { 
      "actionStatus" => dirty["actionStatus"],
      "content" => clean_content
    }

  end
end
  