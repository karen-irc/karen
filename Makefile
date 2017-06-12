# MIT License
#
# Copyright (c) 2017 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
# Copyright (c) 2017 Yusuke Suzuki <utatane.tea@gmail.com>
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.


####################################
# Variables
####################################

# GIT_REVISION := $(shell git rev-parse --verify HEAD)
# BUILD_DATE := $(shell date '+%Y/%m/%d %H:%M:%S %z')
NODE_BIN := node
NPM_MOD := $(CURDIR)/node_modules
NPM_BIN := $(NPM_MOD)/.bin

OBJ_DIR := $(CURDIR)/__obj
DIST_DIR := $(CURDIR)/__dist
TEST_CACHE_DIR := $(CURDIR)/__test_cache

OBJ_CLIENT := $(OBJ_DIR)/client
OBJ_LIB := $(OBJ_DIR)/lib
OBJ_SERVER := $(OBJ_DIR)/server

DIST_CLIENT := $(DIST_DIR)/client
DIST_LIB := $(DIST_DIR)/lib
DIST_SERVER := $(DIST_DIR)/server
DIST_STYLE := $(DIST_DIR)/style

TEST_CACHE_CLIENT := $(TEST_CACHE_DIR)/client
TEST_CACHE_LIB := $(TEST_CACHE_DIR)/lib
TEST_CACHE_SERVER := $(TEST_CACHE_DIR)/server

NODE_ENV ?= development
TEST_TARGET ?= "$(TEST_CACHE_DIR)/**/test/**/*.js"

BABEL_OPTION_FOR_SERVER := $(CURDIR)/tools/build/babelrc_for_server.js;

####################################
# Generic Target
####################################
#
# public task
# --------------
#	- This is completed in itself.
# 	- This is callable as `make <taskname>`.
#
# private task
# --------------
#
#	- This has some sideeffect in dependent task trees
#     and it cannot recovery by self.
#  	- This is __callable only from public task__.
#     DONT CALL as `make <taskname>`.
#  	- MUST name `__taskname`.
#
####################################

.PHONY: help
.DEFAULT_GOAL: help

help:
	@echo "These are public command list (\`・ω・´)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@exit 1


####################################
# Bootstrap
####################################

install: ## Install required dependencies.
	yarn install


####################################
# Clean
####################################

clean: clean_dist clean_obj clean_test_cache ## Clean all built files and caches.
clean_client: clean_dist_client clean_obj_client ## Clean built client artifacts.
clean_lib: clean_dist_lib clean_obj_lib ## Clean built shared artifacts.
clean_server: clean_dist_server clean_obj_server ## Clean built server artifacts.
clean_style: clean_dist_style ## Clean built style artifacts.

clean_dist:
	$(NPM_BIN)/del $(DIST_DIR)
clean_obj:
	$(NPM_BIN)/del $(OBJ_DIR)
clean_test_cache:
	$(NPM_BIN)/del $(TEST_CACHE_DIR)

clean_dist_client:
	$(NPM_BIN)/del $(DIST_CLIENT)
clean_dist_lib:
	$(NPM_BIN)/del $(DIST_LIB)
clean_dist_server:
	$(NPM_BIN)/del $(DIST_SERVER)
clean_dist_style:
	$(NPM_BIN)/del $(DIST_STYLE)

clean_obj_client:
	$(NPM_BIN)/del $(OBJ_CLIENT)
clean_obj_lib:
	$(NPM_BIN)/del $(OBJ_LIB)
clean_obj_server:
	$(NPM_BIN)/del $(OBJ_SERVER)

clean_test_cache_client:
	$(NPM_BIN)/del $(TEST_CACHE_CLIENT)
clean_test_cache_lib:
	$(NPM_BIN)/del $(TEST_CACHE_LIB)
clean_test_cache_server:
	$(NPM_BIN)/del $(TEST_CACHE_SERVER)


####################################
# Build (public interface)
#
#  - `make production`
#  - `make development`
####################################

production: build_env_production ## Make the production build.
development: build_env_development ## Make the development build.

build_env_%:
	$(NPM_BIN)/cross-env NODE_ENV=$* make build -j 16 -C ./

####################################
# Build
####################################

build: lint build_dist_client build_dist_server build_dist_legacy_lib build_dist_style

build_dist_client: clean_dist_client build_obj_client build_obj_lib
	$(NPM_BIN)/cross-env \
		NODE_ENV=$(NODE_ENV) \
		$(NPM_BIN)/webpack --config $(CURDIR)/webpack.config.js

build_dist_legacy_lib: clean_dist_client
	$(NPM_BIN)/cpx $(NPM_MOD)/moment/min/moment.min.js $(DIST_CLIENT)

build_dist_server: clean_dist_server build_obj_server build_obj_lib $(OBJ_SERVER)/.babelrc
	$(NPM_BIN)/babel $(OBJ_SERVER) --source-maps=inline --extensions=.js,.jsx --out-dir=$(DIST_SERVER)

build_dist_style: stylelint clean_dist_style
	$(NPM_BIN)/postcss -c $(CURDIR)/postcss.config.js \
		-d $(DIST_STYLE) \
		$(CURDIR)/src/style/style.css

build_obj_client: tsc cp_obj_client
build_obj_server: cp_obj_server
build_obj_lib: tsc cp_obj_lib

tsc: clean_obj_client clean_obj_lib clean_obj_server
	$(NPM_BIN)/tsc --project $(CURDIR)/tsconfig.json

cp_obj_%: eslint clean_obj_%
	$(NPM_BIN)/cpx '$(CURDIR)/src/$*/**/*.{js,jsx}' $(OBJ_DIR)/$* --preserve

$(OBJ_SERVER)/.babelrc: build_obj_server
	$(NODE_BIN) $(CURDIR)/tools/build/generate_babelrc.js --target-dir=$(OBJ_SERVER) --config-path=$(BABEL_OPTION_FOR_SERVER)


####################################
# Lint
####################################

lint: eslint tslint stylelint # Run all lint target.

eslint:
	$(NPM_BIN)/eslint --ext=.js,.jsx $(CURDIR)

tslint:
	$(NPM_BIN)/tslint --config $(CURDIR)/tslint.json '$(CURDIR)/src/**/*.ts{,x}' '$(CURDIR)/config/**/*.ts{,x}'

stylelint:
	$(NPM_BIN)/stylelint 'src/style/**/*' \
		--config=$(CURDIR)/stylelint.config.js \
		-f verbose \
		--color \
		--report-needless-disables


####################################
# Test
####################################

__run_test:
	node $(CURDIR)/tools/test_launcher.js \
		--manifest "$(TEST_CACHE_DIR)/$(TEST_CATEGORY)/test_manifest.js"

test: lint build_test_client build_test_lib ## Run all unit tests and lints.
	$(NPM_BIN)/cross-env TEST_CATEGORY=client make __run_test -C $(CURDIR)
	$(NPM_BIN)/cross-env TEST_CATEGORY=lib make __run_test -C $(CURDIR)

test_client: build_test_client
	$(NPM_BIN)/cross-env TEST_CATEGORY=client make __run_test -C $(CURDIR)

test_lib: build_test_lib
	$(NPM_BIN)/cross-env TEST_CATEGORY=lib make __run_test -C $(CURDIR)

build_test_client: clean_test_cache_client build_obj_client $(OBJ_CLIENT)/.babelrc
	$(NPM_BIN)/babel $(OBJ_CLIENT) --source-maps=inline --extensions=.js,.jsx --out-dir=$(TEST_CACHE_CLIENT)

build_test_lib: clean_test_cache_lib build_obj_lib $(OBJ_LIB)/.babelrc
	$(NPM_BIN)/babel $(OBJ_LIB) --source-maps=inline --extensions=.js,.jsx --out-dir=$(TEST_CACHE_LIB)

$(OBJ_CLIENT)/.babelrc: build_obj_client
	$(NODE_BIN) $(CURDIR)/tools/build/generate_babelrc.js --target-dir=$(OBJ_CLIENT) --config-path=$(BABEL_OPTION_FOR_SERVER)

$(OBJ_LIB)/.babelrc: build_obj_lib
	$(NODE_BIN) $(CURDIR)/tools/build/generate_babelrc.js --target-dir=$(OBJ_LIB) --config-path=$(BABEL_OPTION_FOR_SERVER)


####################################
# Automation
####################################

ci: development test
