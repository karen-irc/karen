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

const autoprefixer = require('autoprefixer');
const babel = require('gulp-babel');
const babelify = require('babelify');
const browserify = require('browserify');
const del = require('del');
const glob = require('glob');
const gulp = require('gulp');
const path = require('path');
const postcss = require('gulp-postcss');
const source = require('vinyl-source-stream');
const spawnChildProcess = require('./utils/spawn');
const uglify = require('gulp-uglifyjs');

const isRelease = process.env.NODE_ENV === 'production';

const DIST_SERVER = './dist/server/';
const DIST_CLIENT = './dist/client/';
const DIST_CLIENT_OBJ = path.resolve(DIST_CLIENT, './__obj/');
const DIST_CLIENT_JS = path.resolve(DIST_CLIENT, './js/');
const DIST_CLIENT_CSS = path.resolve(DIST_CLIENT, './css/');
const NPM_MOD_DIR = path.resolve(__dirname, './node_modules/');

const CLIENT_SRC_JS = [
    'client/js/libs/jquery.js',
    'client/js/libs/jquery/**/*.js',
    path.resolve(NPM_MOD_DIR, './moment/moment.js'),
    'client/js/libs/stringcolor.js',
    'client/js/libs/parse.js',
    'client/js/libs/uri.js',
];

const SERVER_SRC = [
    './server/**/*.@(js|jsx)'
];

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
    return gulp.src(CLIENT_SRC_JS)
        .pipe(uglify('libs.min.js', {
            compress: false,
        }))
        .pipe(gulp.dest(DIST_CLIENT_JS));
});

gulp.task('__cp:client:js', ['__clean:client:js'], function () {
    return gulp.src('./client/script/**/*.@(js|jsx)')
        .pipe(gulp.dest(DIST_CLIENT_OBJ));
});

gulp.task('__typescript', ['__clean:client:js'], function () {
    const args = [
        path.resolve(NPM_MOD_DIR, './typescript', './bin', './tsc'),
    ];
    const option = {
        cwd: path.relative(__dirname, ''),
        stdio: 'inherit',
    };
    return spawnChildProcess('node', args, option);
});

gulp.task('__browserify', ['__clean:client:js', '__cp:client:js', '__typescript'], function () {
    const ENTRY_POINT = [
        path.resolve(DIST_CLIENT_OBJ, './karen.js'),
    ];

    const option = {
        insertGlobals: false,
        debug: !isRelease,
        extensions: ['.jsx'],
    };

    let babelOptions = [];
    if (isRelease) {
        babelOptions = babelOptions.concat([
            'optimisation.react.constantElements',
            'optimisation.react.inlineElements',
        ]);
    }

    const babel = babelify.configure({
        optional: babelOptions,
    });

    return browserify(ENTRY_POINT, option)
        .transform(babel)
        .bundle()
        .pipe(source('karen.js'))
        .pipe(gulp.dest(DIST_CLIENT_JS));
});

gulp.task('__postcss', ['__clean:client:css'], function () {
    const processors = [
        autoprefixer({
            browsers: ['last 1 versions'],
            remove: false,
        }),
    ];
    return gulp.src('./client/css/style.css')
        .pipe(postcss(processors))
        .pipe(gulp.dest(DIST_CLIENT_CSS));
});

gulp.task('__eslint', function () {
    const src = [
        './gulpfile.js',
        './client/script/',
        './defaults/',
        './server/',
    ];

    const bin = path.resolve(NPM_MOD_DIR, './eslint', './bin', './eslint.js');

    const args = [
        bin,
        '--ext', '.js,.jsx',
    ].concat(src);

    const option = {
        cwd: path.relative(__dirname, ''),
        stdio: 'inherit',
    };

    return spawnChildProcess('node', args, option);
});

gulp.task('__tslint', function () {
    const SRC = './@(client|server)/**/*.@(ts|tsx)';

    const files = new Promise(function(resolve, reject){
        glob(SRC, {}, function (err, matched) {
            if (!!err) {
                reject(err);
            }
            else {
                resolve(matched);
            }
        });
    });

    const process = files.then(function(src) {
        const bin = path.resolve(NPM_MOD_DIR, './tslint', './bin', './tslint-cli.js');

        const args = [
            bin,
        ].concat(src);

        const option = {
            cwd: path.relative(__dirname, ''),
            stdio: 'inherit',
        };

        return spawnChildProcess('node', args, option);
    });

    return process;
});

gulp.task('__babel:server', ['clean:server'], function () {
    let babelOptions = [];
    if (isRelease) {
        babelOptions = babelOptions.concat([
            'optimisation.react.constantElements',
            'optimisation.react.inlineElements',
        ]);
    }

    return gulp.src(SERVER_SRC)
        .pipe(babel({
            optional: babelOptions,

            // For Node.js v4~, we need not some transforms:
            blacklist: [
                'es6.arrowFunctions',
                'es6.blockScoping',
                'es6.classes',
                'es6.constants',
                'es6.forOf',
                'es6.properties.shorthand',
                'es6.templateLiterals',
            ],
            sourceMaps: false,
        }))
        .pipe(gulp.dest(DIST_SERVER));
});

gulp.task('__clean:client:js', function () {
    const deleter = function (dir) {
        return del(path.join(dir, '**', '*.*'));
    };

    const obj = deleter(DIST_CLIENT_OBJ);
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
gulp.task('build:server', ['jslint', '__build:server']);
gulp.task('build:client', ['jslint', '__build:client:js', '__build:client:css']);
gulp.task('build', ['build:server', 'build:client']);
gulp.task('clean:client', ['__clean:client:js', '__clean:client:css']);
gulp.task('clean', ['clean:client', 'clean:server']);
gulp.task('default', ['build']);
