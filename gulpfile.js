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

const { doCopy } = require('./tools/build/cp');

const {
    buildLegacyLib,
    runLinkerForClient,
    compileScriptForServer,
} = require('./tools/build/script');
const {buildCSS} = require('./tools/build/style');

const isRelease = process.env.NODE_ENV === 'production';

const NPM_MOD_DIR = path.resolve(__dirname, './node_modules/');

const OBJ_DIR = path.resolve(__dirname, './__obj/');
const DIST_DIR = path.resolve(__dirname, './__dist/');
const TEST_CACHE_DIR = path.resolve(__dirname, './__test_cache/');

const OBJ_LIB = path.resolve(OBJ_DIR, './lib/');
const OBJ_CLIENT = path.resolve(OBJ_DIR, './client/');
const OBJ_SERVER = path.resolve(OBJ_DIR, './server/');

const DIST_SERVER = path.resolve(DIST_DIR, './server/');
const DIST_LIB = path.resolve(DIST_DIR, './lib/');
const DIST_CLIENT = path.resolve(DIST_DIR, './client/');
const DIST_CLIENT_JS = path.resolve(DIST_CLIENT, './js/');
const DIST_CLIENT_CSS = path.resolve(DIST_CLIENT, './css/');

const TEST_CACHE_LIB = path.resolve(TEST_CACHE_DIR, './lib/');
const TEST_CACHE_CLIENT = path.resolve(TEST_CACHE_DIR, './client/');
const TEST_CACHE_SERVER = path.resolve(TEST_CACHE_DIR, './server/');

const CLIENT_SRC_JS = [
    path.resolve(NPM_MOD_DIR, './moment/moment.js'),
];

const CWD = path.relative(__dirname, '');

/**
 *  # The rules of task name
 *
 *  ## public task
 *  - This is completed in itself.
 *  - This is callable as `gulp <taskname>`.
 *
 *  ## private task
 *  - This has some sideeffect in dependent task trees
 *    and it cannot recovery by self.
 *  - This is __callable only from public task__.
 *    DONT CALL as `gulp <taskname>`.
 *  - MUST name `__taskname`.
 */

/**
 *  Clean
 */

/**
 *  Build obj/
 */
gulp.task('__cp:client:js:obj', [], function () {
    const src = ['./src/client/**/*.@(js|jsx)'];
    const objDir = path.resolve(OBJ_CLIENT);
    return doCopy(src, objDir);
});

gulp.task('__cp:lib:obj', [], function () {
    const src = ['./src/lib/**/*.@(js|jsx)'];
    return doCopy(src, OBJ_LIB);
});

gulp.task('__cp:server:js:obj', [], function () {
    const src = ['./src/server/**/*.@(js|jsx)'];
    return doCopy(src, OBJ_SERVER);
});

/*
gulp.task('__typescript', ['__clean:client:js:obj', '__clean:lib:obj'], function () {
    return compileTypeScript(CWD, NPM_MOD_DIR, __dirname);
});
*/

/**
 *  Build dist/
 */
gulp.task('__link:client:js', [], function () {
    const root = './karen.js';
    const ENTRY_POINT = path.resolve(OBJ_CLIENT, root);

    return runLinkerForClient(CWD, NPM_MOD_DIR, ENTRY_POINT, DIST_CLIENT_JS);
});

gulp.task('__babel:server', [], function () {
    return compileScriptForServer(CWD, NPM_MOD_DIR, OBJ_SERVER, DIST_SERVER, isRelease);
});

gulp.task('__babel:lib:test', [], function () {
    return compileScriptForServer(CWD, NPM_MOD_DIR, OBJ_LIB, TEST_CACHE_LIB, false);
});

gulp.task('__babel:client:test', [], function () {
    return compileScriptForServer(CWD, NPM_MOD_DIR, OBJ_CLIENT, TEST_CACHE_CLIENT, false);
});

gulp.task('__babel:server:test', [], function () {
    return compileScriptForServer(CWD, NPM_MOD_DIR, OBJ_SERVER, TEST_CACHE_SERVER, false);
});

/**
 *  Others
 */
gulp.task('__postcss', [], function () {
    return buildCSS('./src/style/style.css', DIST_CLIENT_CSS);
});

gulp.task('__uglify', [], function () {
    return buildLegacyLib(CLIENT_SRC_JS, DIST_CLIENT_JS, 'libs.min.js');
});

/**
 *  Meta targets
 */

/**
 *  Public targets
 */
