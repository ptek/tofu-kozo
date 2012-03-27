all: clean test

test:
	@bundle exec rspec spec

clean:
	-killall -9 phantomjs
	@rm -rf /tmp/tofu-kozo
	@rm -rf ./phantom.log
	@rm -rf ./webserver.log