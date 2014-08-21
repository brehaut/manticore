build: clean, bundle_contrib_js
	mkdir -p target/static/{css,js,data}
	cp static/data/* target/static/data/
	cp static/css/* target/static/css/
	cp static/js/* target/static/js/
	cp index.html target/
	tsc src/ts/manticore.ts --out target/static/js/main.js

clean:
	rm -rf target

bundle_contrib_js:
	cat src/js/contrib/* > static/js/contrib.js

watch: bundle_contrib_js
	tsc -w src/ts/manticore.ts --out static/js/main.js

server:
	python -m SimpleHTTPServer
