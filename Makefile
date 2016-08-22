NODE_MODULES = ./node_modules
NPM_BIN = $(NODE_MODULES)/.bin

all:
	@echo "In almost case, use via npm run ****"
	@exit 1

####################################
# Clean
####################################
clean: clean_dist clean_obj clean_test_cache
clean_client: clean_obj_client clean_dist
clean_server: clean_obj_server clean_dist_server
clean_lib: clean_obj_lib clean_dist_lib

clean_dist:
	rm -rf ./__dist

clean_obj:
	rm -rf ./__obj

clean_test_cache:
	rm -rf ./__test_cache

clean_dist_client:
	rm -rf ./__dist/client

clean_dist_style:
	rm -rf ./__dist/style

clean_dist_server:
	rm -rf ./__dist/server

clean_dist_lib:
	rm -rf ./__dist/lib

clean_obj_client:
	rm -rf ./__obj/client

clean_obj_server:
	rm -rf ./__obj/server

clean_obj_lib:
	rm -rf ./__obj/lib

clean_test_client:
	rm -rf ./__test_cache/client

clean_test_server:
	rm -rf ./__test_cache/server

clean_test_lib:
	rm -rf ./__test_cache/lib

####################################
# Build
####################################
build: lint build_dist_server build_dist_client build_dist_style build_dist_legacy_lib

build_dist_client: clean_dist_client build_obj_client build_obj_lib build_dist_legacy_lib
	$(NPM_BIN)/gulp __link:client:js

build_dist_legacy_lib: clean_dist_client
	$(NPM_BIN)/gulp __uglify

build_dist_server: clean_dist_server build_obj_server build_obj_lib
	$(NPM_BIN)/gulp __babel:server

build_dist_style: stylelint clean_dist_style
	$(NPM_BIN)/gulp __postcss

build_obj_client: tsc cp_obj_client

build_obj_server: cp_obj_server

build_obj_lib: tsc cp_obj_lib

tsc: clean_obj_client clean_obj_lib clean_obj_server
	$(NPM_BIN)/tsc --project ./tsconfig.json

cp_obj_client: clean_obj_client
	$(NPM_BIN)/copyfiles ./src/client/**/*.@\(js\|jsx\) __obj/ -u 1

cp_obj_server: eslint clean_obj_server
	$(NPM_BIN)/copyfiles ./src/server/**/*.@\(js\|jsx\) __obj/ -u 1

cp_obj_lib: eslint clean_obj_lib
	$(NPM_BIN)/copyfiles ./src/lib/**/*.@\(js\|jsx\) __obj/ -u 1

####################################
# Lint
####################################
lint: eslint tslint stylelint

eslint:
	$(NPM_BIN)/eslint --ext .js,.jsx . ./**/.eslintrc.js ./.eslintrc.js

tslint:
	$(NPM_BIN)/tslint --project ./tsconfig.json --config ./tsconfig.json

stylelint:
	$(NPM_BIN)/stylelint src/style/**/* --config ./stylelint.config.js -f verbose --color

####################################
# Test
####################################

test: lint build_test_client build_test_lib
	node ./tools/test_launcher.js --manifest client/test_manifest.js
	node ./tools/test_launcher.js --manifest lib/test_manifest.js

test_client: build_test_client
	node ./tools/test_launcher.js --manifest client/test_manifest.js

test_lib: build_test_lib
	node ./tools/test_launcher.js --manifest lib/test_manifest.js

build_test_client: clean_test_client build_obj_client
	$(NPM_BIN)/gulp __babel:client:test

build_test_lib: clean_test_lib build_obj_lib
	$(NPM_BIN)/gulp __babel:lib:test

####################################
# CI
####################################

ci: build test
