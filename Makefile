build_stock: build
	rm target/static/data/custom.json

build: clean bundle_contrib_js
	mkdir -p target/static/{css,js,data,images}
	cp static/data/* target/static/data/
	cp static/css/* target/static/css/
	cp static/js/* target/static/js/
	cp static/images/* target/static/images/
	cp index.html target/
	tsc src/ts/manticore.ts --removeComments --out target/static/js/main.js

release: build_stock
	echo '{"campaign": [\n    ["Example monster", 1, "normal", "troop", ["test", "tags"]]\n]}\n' > target/static/data/custom.json
	zip manticore-release.zip -r target	

clean:
	rm -rf target
	rm static/js/*

bundle_contrib_js:
	cat src/js/contrib/* > static/js/contrib.js

watch: bundle_contrib_js
	tsc -w src/ts/manticore.ts --sourcemap --out static/js/main.js

server:
	python -m SimpleHTTPServer
