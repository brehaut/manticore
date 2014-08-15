build: clean
	mkdir -p target/static/{css,js}
	cp static/css/* target/static/css/
	cp index.html target/
	tsc src/ts/manticore.ts --out target/static/js/main.js

clean:
	rm -rf target

watch:
	tsc -w src/ts/manticore.ts --out static/js/main.js
