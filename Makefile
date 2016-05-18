# programs
TSC = node_modules/typescript/bin/tsc

# files and paths
SRC_ROOT = src
STATIC_ROOT = static
TARGET_ROOT = target

SCRIPTS = $(STATIC_ROOT)/js
STYLES = $(STATIC_ROOT)/css
IMAGES = $(STATIC_ROOT)/images
DATA = $(STATIC_ROOT)/data

MANIFEST = manifest.appcache

TS_APP_SRC = $(SRC_ROOT)/ts/manticore.ts
TS_APP_OUT = $(SCRIPTS)/main.js

default: build_stock

clean:
	rm -rf $(TARGET_ROOT)
	rm static/js/*

bundle_contrib_js:
	cat src/js/contrib/* > $(SCRIPTS)/contrib.js

manifest:
	echo "CACHE MANIFEST\n\n# Generated:" > $(MANIFEST)
	date -u +#\ %Y%m%d:%H%M%S >> $(MANIFEST)
	echo >> $(MANIFEST)$

	cat $(SRC_ROOT)/manifest-static >> $(MANIFEST);
	for file in $(SCRIPTS)/*; do echo $$file >> $(MANIFEST); done
	for file in $(STYLES)/*.css; do echo $$file >> $(MANIFEST); done
	for file in $(STYLES)/alegreya/*; do echo $$file >> $(MANIFEST); done
	for file in $(DATA)/*; do echo $$file >> $(MANIFEST); done
	for file in $(IMAGES)/*; do echo $$file >> $(MANIFEST); done
	
	# a hack because gulp is doing dumb things with file timestamps
	for file in $(SCRIPTS)/*; do touch $$file; done


build_ts:
	echo "Deprecation warning: `make build_ts` is now legacy; switch to `gulp` for build."
	gulp default


bundle_all: clean bundle_contrib_js build_ts manifest
	mkdir -p $(TARGET_ROOT)/$(STATIC_ROOT)/{css,js,data,images}
	cp $(DATA)/* $(TARGET_ROOT)/$(DATA)/
	cp -r $(STYLES)/* $(TARGET_ROOT)/$(STYLES)/
	cp $(SCRIPTS)/* $(TARGET_ROOT)/$(SCRIPTS)/
	cp $(IMAGES)/* $(TARGET_ROOT)/$(IMAGES)/
	cp $(MANIFEST) $(TARGET_ROOT)/
	cp index.html $(TARGET_ROOT)/	

build_stock: bundle_all manifest
	rm target/static/data/custom.json

release: clean build_stock manifest 
	echo '{"campaign": [\n    ["Example monster", 1, "normal", "troop", ["test", "tags"]]\n]}\n' > $(TARGET_ROOT)/$(DATA)/custom.json
	zip manticore-release.zip -r target	

# development time utility targets

watch: bundle_contrib_js manifest
	echo "Deprecation warning: `make watch` is now legacy; switch to `gulp watch` for a better dev watcher."	
	gulp watch

server:
	python -m SimpleHTTPServer
