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

const del = require('del');
const gulp = require('gulp');
const path = require('path');

const {
    runLinkerForClient,
    compileScriptForServer,
} = require('./tools/build/script');
const { getSuffixedCommandName } = require('./tools/platform');
const { spawnChildProcess, assertReturnCode } = require('./tools/spawn');

const isRelease = process.env.NODE_ENV === 'production';

const NPM_MOD_DIR = path.resolve(__dirname, './node_modules/');

const OBJ_DIR = path.resolve(__dirname, './__obj/');
const DIST_DIR = path.resolve(__dirname, './__dist/');
const TEST_CACHE_DIR = path.resolve(__dirname, './__test_cache/');

const OBJ_CLIENT = path.resolve(OBJ_DIR, './client/');
const OBJ_LIB = path.resolve(OBJ_DIR, './lib/');
const OBJ_SERVER = path.resolve(OBJ_DIR, './server/');

const DIST_CLIENT = path.resolve(DIST_DIR, './client/');
const DIST_LIB = path.resolve(DIST_DIR, './lib');
const DIST_SERVER = path.resolve(DIST_DIR, './server/');
const DIST_STYLE = path.resolve(DIST_DIR, './style/');

const TEST_CACHE_CLIENT = path.resolve(TEST_CACHE_DIR, './client/');
const TEST_CACHE_LIB = path.resolve(TEST_CACHE_DIR, './lib/');
const TEST_CACHE_SERVER = path.resolve(TEST_CACHE_DIR, './server/');

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

function execCommand(cmd, args) {
    const option = {
        cwd: CWD,
        stdio: 'inherit',
    };
    return spawnChildProcess(cmd, args, option).then(assertReturnCode);
}

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
gulp.task('clean', ['clean_dist', 'clean_obj', 'clean_test_cache']);
gulp.task('clean_client', ['clean_dist_client', 'clean_obj_client']);
gulp.task('clean_lib', ['clean_dist_lib', 'clean_obj_lib']);
gulp.task('clean_server', ['clean_dist_server', 'clean_obj_server']);
gulp.task('clean_style', ['clean_dist_style']);

gulp.task('clean_dist', () => del(DIST_DIR));
gulp.task('clean_obj', () => del(OBJ_DIR));
gulp.task('clean_test_cache', () => del(TEST_CACHE_DIR));

gulp.task('clean_dist_client', () => del(DIST_CLIENT));
gulp.task('clean_dist_lib', () => del(DIST_LIB));
gulp.task('clean_dist_server', () => del(DIST_SERVER));
gulp.task('clean_dist_style', () => del(DIST_STYLE));

gulp.task('clean_obj_client', () => del(OBJ_CLIENT));
gulp.task('clean_obj_lib', () => del(OBJ_LIB));
gulp.task('clean_obj_server', () => del(OBJ_SERVER));

gulp.task('clean_test_cache_client', () => del(TEST_CACHE_CLIENT));
gulp.task('clean_test_cache_lib', () => del(TEST_CACHE_LIB));
gulp.task('clean_test_cache_server', () => del(TEST_CACHE_SERVER));


/**
 *  Build
 */
gulp.task('build', ['lint', 'build_dist_client', 'build_dist_server', 'build_dist_style', 'build_dist_legacy_lib']);

gulp.task('build_dist_client', ['clean_dist_client', 'build_obj_client', 'build_obj_lib', 'build_dist_legacy_lib'], function () {
    const root = './karen.js';
    const ENTRY_POINT = path.resolve(OBJ_CLIENT, root);

    return runLinkerForClient(CWD, NPM_MOD_DIR, ENTRY_POINT, DIST_CLIENT);
});

gulp.task('build_dist_legacy_lib', ['clean_dist_client'], function () {
    return execNpmCmd('copyfiles', [
        path.resolve(NPM_MOD_DIR, './moment/min/moment.min.js'),
        DIST_CLIENT,
        '--flat',
    ]);
});

gulp.task('build_dist_server', ['clean_dist_server', 'build_obj_server', 'build_obj_lib'], function () {
    return compileScriptForServer(CWD, NPM_MOD_DIR, OBJ_SERVER, DIST_SERVER, isRelease);
});

gulp.task('build_dist_style', ['stylelint', 'clean_dist_style'], function () {
    return execNpmCmd('postcss', [
        '-c', './postcss.config.js',
        '-d', DIST_STYLE,
        './src/style/style.css',
    ]);
});

gulp.task('build_obj_client', ['tsc', 'cp_obj_client']);
gulp.task('build_obj_server', ['cp_obj_server']);
gulp.task('build_obj_lib', ['tsc', 'cp_obj_lib']);

gulp.task('tsc', ['clean_obj_client', 'clean_obj_lib', 'clean_obj_server'], function () {
    return execNpmCmd('tsc', [
        '--project',
        './tsconfig.json',
    ]);
});

function cpToObj(dir) {
    return execNpmCmd('copyfiles', [
        `./src/${dir}/**/*.@(js|jsx)`,
        OBJ_DIR,
        '-u', '1',
    ]);
}

gulp.task('cp_obj_client', ['eslint', 'clean_obj_client'], function () {
    return cpToObj('client');
});

gulp.task('cp_obj_lib', ['eslint', 'clean_obj_lib'], function () {
    return cpToObj('lib');
});

gulp.task('cp_obj_server', ['eslint', 'clean_obj_server'], function () {
    return cpToObj('server');
});


/**
 *  Lint
 */
gulp.task('lint', ['eslint', 'tslint', 'stylelint']);

gulp.task('eslint', function () {
    return execNpmCmd('eslint', [
        '--ext', '.js,.jsx',
        '.',
    ]);
});

gulp.task('tslint', function () {
    return execNpmCmd('tslint', [
        '--project', './tsconfig.json',
        '--config', './tsconfig.json',
    ]);
});

gulp.task('stylelint', function () {
    return execNpmCmd('stylelint', [
        'src/style/**/*',
        '--config', './stylelint.config.js',
        '-f', 'verbose',
        '--color',
        '--report-needless-disables',
    ]);
});


/**
 *  Test
 */

function runTest(dir) {
    return execCommand('node', [
        './tools/test_launcher.js',
        '--manifest', path.join('__test_cache', dir, 'test_manifest.js'),
    ]);
}

gulp.task('test', ['lint', 'build_test_client', 'build_test_lib'], function () {
    return runTest('client').then(() => runTest('lib'));
});

gulp.task('test_client', ['build_test_client'], function () {
    return runTest('client');
});

gulp.task('test_lib', ['build_test_lib'], function () {
    return runTest('lib');
});

gulp.task('build_test_client', ['clean_test_cache_client', 'build_obj_client'], function () {
    return compileScriptForServer(CWD, NPM_MOD_DIR, OBJ_CLIENT, TEST_CACHE_CLIENT, false);
});

gulp.task('build_test_lib', ['clean_test_cache_lib', 'build_obj_lib'], function () {
    return compileScriptForServer(CWD, NPM_MOD_DIR, OBJ_LIB, TEST_CACHE_LIB, false);
});


/**
 *  CI
 */
gulp.task('ci', ['build', 'test']);
