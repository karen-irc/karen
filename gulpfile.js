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

const copyMod = require('./tools/build/cp');
const doCopy = copyMod.doCopy;

const scriptMod = require('./tools/build/script');
const compileTypeScript = scriptMod.compileTypeScript;
const buildLegacyLib = scriptMod.buildLegacyLib;
const runLinkerForClient = scriptMod.runLinkerForClient;
const compileScriptForServer = scriptMod.compileScriptForServer;

const lintMod = require('./tools/build/lint');
const runESLint = lintMod.runESLint;
const runTSLint = lintMod.runTSLint;

const styleMod = require('./tools/build/style');
const buildCSS = styleMod.buildCSS;

const isRelease = process.env.NODE_ENV === 'production';
const isEnableRize = process.env.ENABLE_RIZE === '1';

const NPM_MOD_DIR = path.resolve(__dirname, './node_modules/');

const SRC_DIR = path.resolve(__dirname, './src/');
const OBJ_DIR = path.resolve(__dirname, './obj/');
const DIST_DIR = path.resolve(__dirname, './dist/');

const SRC_SERVER = path.resolve(SRC_DIR, './server');

const DIST_SERVER = path.resolve(DIST_DIR, './server/');
const DIST_CLIENT = path.resolve(DIST_DIR, './client/');
const DIST_CLIENT_JS = path.resolve(DIST_CLIENT, './js/');
const DIST_CLIENT_CSS = path.resolve(DIST_CLIENT, './css/');

const CLIENT_SRC_JS = [
    path.resolve(NPM_MOD_DIR, './moment/moment.js'),
    path.resolve(SRC_DIR, './client/js/libs/stringcolor.js'),
    path.resolve(SRC_DIR, './client/js/libs/parse.js'),
    path.resolve(NPM_MOD_DIR, './urijs/src/URI.js'),
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

gulp.task('__uglify', ['__clean:client:js'], function () {
    if (isEnableRize) {
        return Promise.resolve();
    }
    else {
        return buildLegacyLib(CLIENT_SRC_JS, DIST_CLIENT_JS, 'libs.min.js');
    }
});

gulp.task('__cp:client:js', ['__cp:client:js:rize', '__cp:client:js:classic']);
gulp.task('__cp:client:js:classic', ['__clean:client:js'], function () {
    const src = ['./src/client/script/**/*.@(js|jsx)'];
    const objDir = path.resolve(OBJ_DIR, './script');
    return doCopy(src, objDir);
});
gulp.task('__cp:client:js:rize', ['__clean:client:js'], function () {
    if (!isEnableRize) {
        return Promise.resolve();
    }
    else {
        const src = ['./src/client/rize/**/*.@(js|jsx)'];
        const objDir = path.resolve(OBJ_DIR, './rize');
        return doCopy(src, objDir);
    }
});

gulp.task('__typescript', ['__clean:client:js'], function () {
    return compileTypeScript(CWD, NPM_MOD_DIR);
});

gulp.task('__browserify', ['__clean:client:js', '__cp:client:js', '__typescript'], function () {
    const root = isEnableRize ?
        './rize/index.js' : './script/karen.js';
    const ENTRY_POINT = path.resolve(OBJ_DIR, root);

    return runLinkerForClient(ENTRY_POINT, DIST_CLIENT_JS, 'karen.js', isRelease);
});

gulp.task('__postcss', ['__clean:client:css'], function () {
    return buildCSS('./src/client/css/style.css', DIST_CLIENT_CSS);
});

gulp.task('__eslint', function () {
    const src = [
        './.eslintrc.js',
        './gulpfile.js',
        './defaults/',
        './src/client/.eslintrc.js',
        './src/client/script/',
        './src/client/rize/',
        './src/server/',
        './tools/',
    ];
    return runESLint(CWD, NPM_MOD_DIR, src);
});

gulp.task('__tslint', function () {
    const SRC = [
        './src/client/**/*.@(ts|tsx)',
        './src/server/**/*.@(ts|tsx)',
    ];
    return runTSLint(CWD, NPM_MOD_DIR, SRC);
});

gulp.task('__babel:server', ['clean:server'], function () {
    return compileScriptForServer(CWD, NPM_MOD_DIR, SRC_SERVER, DIST_SERVER, isRelease);
});

gulp.task('__clean:client:js', function () {
    const deleter = function (dir) {
        return del(path.join(dir, '**', '*.*'));
    };

    const obj = deleter(OBJ_DIR);
    const dist = deleter(DIST_CLIENT_JS);

    return Promise.all([obj, dist]);
});

gulp.task('__clean:client:css', function () {
    return del(path.join(DIST_CLIENT_CSS, '**', '*.*'));
});

gulp.task('clean:server', function () {
    return del(path.join(DIST_SERVER, '**', '*.*'));
});

gulp.task('__build:server', ['__babel:server']);
gulp.task('__build:client:js', ['__uglify', '__browserify']);
gulp.task('__build:client:css', ['__postcss']);

gulp.task('jslint', ['__eslint', '__tslint']);
gulp.task('tsc', ['__typescript']);
gulp.task('build:server', ['jslint', '__build:server']);
gulp.task('build:client', ['jslint', '__build:client:js', '__build:client:css']);
gulp.task('build', ['build:server', 'build:client']);
gulp.task('clean:client', ['__clean:client:js', '__clean:client:css']);
gulp.task('clean', ['clean:client', 'clean:server']);
gulp.task('default', ['build']);
