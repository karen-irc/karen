/**
 * @license MIT License
 *
 * Copyright (c) 2015 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

const gulp = require('gulp');
const path = require('path');

const {
    compileScriptForServer,
} = require('./tools/build/script');
const { getSuffixedCommandName } = require('./tools/platform');
const { spawnChildProcess, assertReturnCode } = require('./tools/spawn');

const NPM_MOD_DIR = path.resolve(__dirname, './node_modules/');

const OBJ_DIR = path.resolve(__dirname, './__obj/');
const DIST_DIR = path.resolve(__dirname, './__dist/');
const TEST_CACHE_DIR = path.resolve(__dirname, './__test_cache/');

const OBJ_CLIENT = path.resolve(OBJ_DIR, './client/');
const OBJ_LIB = path.resolve(OBJ_DIR, './lib/');
const OBJ_SERVER = path.resolve(OBJ_DIR, './server/');

const DIST_CLIENT = path.resolve(DIST_DIR, './client/');
const DIST_SERVER = path.resolve(DIST_DIR, './server/');

const TEST_CACHE_CLIENT = path.resolve(TEST_CACHE_DIR, './client/');
const TEST_CACHE_LIB = path.resolve(TEST_CACHE_DIR, './lib/');

const CWD = path.relative(__dirname, '');

/**
 *  @param  {string}    cmd
 *  @param  {Array<string>} args
 *  @return     {PromiseLike<number>}
 */
function execNpmCmd(cmd, args) {
    const command = getSuffixedCommandName(cmd);
    const bin = path.resolve(NPM_MOD_DIR, '.bin', command);
    const option = {
        cwd: CWD,
        stdio: 'inherit',
    };
    return spawnChildProcess(bin, args, option).then(assertReturnCode);
}

function buildLegacyLib() {
    return execNpmCmd('cpx', [
        path.resolve(NPM_MOD_DIR, './moment/min/moment.min.js'),
        DIST_CLIENT,
    ]);
}
gulp.task('makefile:build_dist_legacy_lib', [], buildLegacyLib);

function buildDistServer() {
    return compileScriptForServer(CWD, NPM_MOD_DIR, OBJ_SERVER, DIST_SERVER);
}
gulp.task('mekefile:build_dist_server', [], buildDistServer);

function buildTestClient() {
    return compileScriptForServer(CWD, NPM_MOD_DIR, OBJ_CLIENT, TEST_CACHE_CLIENT);
}
gulp.task('makefile:build_test_client', [], buildTestClient);

function buildTestLib() {
    return compileScriptForServer(CWD, NPM_MOD_DIR, OBJ_LIB, TEST_CACHE_LIB);
}
gulp.task('makefile:build_test_lib', [], buildTestLib);
