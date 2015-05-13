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

let babel = require('gulp-babel');
let babelify = require('babelify');
let browserify = require('browserify');
let childProcess = require('child_process');
let concat = require('gulp-concat');
let del = require('del');
let eslint = require('gulp-eslint');
let gulp = require('gulp');
let path = require('path');
let source = require('vinyl-source-stream');
let uglify = require('gulp-uglifyjs');

const isRelease = process.env.NODE_ENV === 'production';

const CLIENT_SRC = [
    'client/js/libs/handlebars.js',
    'client/js/libs/handlebars/**/*.js',
    'client/js/libs/jquery.js',
    'client/js/libs/jquery/**/*.js',
    'client/js/libs/moment.js',
    'client/js/libs/stringcolor.js',
    'client/js/libs/uri.js',
];

const SERVER_SRC = [
    './server/**/*.js'
];

const DIST_SERVER = './dist/';
const DIST_CLIENT = './client/dist/';
const DIST_CLIENT_JS = path.resolve(DIST_CLIENT, './js/');

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


gulp.task('__uglify', ['clean:client'], function () {
    return gulp.src(CLIENT_SRC)
        .pipe(uglify('libs.min.js', {
            compress: false,
        }))
        .pipe(gulp.dest(DIST_CLIENT_JS));
});

gulp.task('__handlebars', ['clean:client'], function () {
    let handlebars = path.relative(__dirname, './node_modules/handlebars/bin/handlebars');
    let args = [
        String(handlebars),
        'client/views/',
        '-e', 'tpl',
        '-f', path.resolve(DIST_CLIENT_JS, './karen.templates.js'),
    ];

    let option = {
        cwd: path.relative(__dirname, ''),
        stdio: 'inherit',
    };
    childProcess.spawn('node', args, option);
});

gulp.task('__browserify', ['clean:client'], function () {
    const ENTRY_POINT = ['./client/script/karen.js'];

    const option = {
        insertGlobals: false,
        debug: !isRelease,
    };

    const babel = babelify.configure({
        optional: [],
    });

    browserify(ENTRY_POINT, option)
        .transform(babel)
        .bundle()
        .pipe(source('karen.js'))
        .pipe(gulp.dest(DIST_CLIENT_JS));
});



gulp.task('jslint', function () {
    let option = {
        useEslintrc: true,
    };

    return gulp.src([
            './gulpfile.js',
            './client/js/karen.js',
            './client/script/**/*.js',
            './defaults/**/*.js',
            './server/**/*.js',
        ])
        .pipe(eslint(option))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('__babel:server', ['clean:server'], function () {
    return gulp.src(SERVER_SRC)
        .pipe(babel({
            // For io.js, we need not some transforms:
            blacklist: [
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

gulp.task('clean:client', function (callback) {
    return del(path.join(DIST_CLIENT, '**', '*.*'), callback);
});

gulp.task('clean:server', function (callback) {
    return del(path.join(DIST_SERVER, '**', '*.*'), callback);
});

gulp.task('__build:server', ['__babel:server']);
gulp.task('__build:client', ['__handlebars', '__uglify', '__browserify']);

gulp.task('build:server', ['jslint', '__build:server']);
gulp.task('build:client', ['jslint', '__build:client']);
gulp.task('build', ['jslint', '__build:client', '__build:server']);
gulp.task('clean', ['clean:client', 'clean:server']);
gulp.task('default', ['build']);
