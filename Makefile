all: clean test

test:
	@bundle exec rspec spec

clean:
	@rm -rf /tmp/tofu-kozo
	@rm -rf ./phantom.log