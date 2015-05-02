/**
 * @license MIT License
 *
 * Copyright (c) 2015 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
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

const SRC = [
    'client/js/libs/favico.js',
    'client/js/libs/handlebars.js',
    'client/js/libs/handlebars/**/*.js',
    'client/js/libs/jquery.js',
    'client/js/libs/jquery/**/*.js',
    'client/js/libs/moment.js',
    'client/js/libs/notification.js',
    'client/js/libs/socket.io.js',
    'client/js/libs/string.contains.js',
    'client/js/libs/stringcolor.js',
    'client/js/libs/uri.js',
];

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
    return gulp.src(SRC)
        .pipe(uglify('libs.min.js', {
            compress: false,
        }))
        .pipe(gulp.dest(DIST_CLIENT_JS));
});

gulp.task('__copy', ['clean:client'], function () {
    var src = [
        './node_modules/rx/dist/rx.js',
    ];
    return gulp.src(src)
        .pipe(gulp.dest(DIST_CLIENT_JS));
});

gulp.task('__handlebars', ['clean:client'], function () {
    let handlebars = path.relative(__dirname, './node_modules/handlebars/bin/handlebars');
    let args = [
        String(handlebars),
        'client/views/',
        '-e', 'tpl',
        '-f', path.resolve(DIST_CLIENT, './js/karen.templates.js'),
    ];

    let option = {
        cwd: path.relative(__dirname, ''),
        stdio: 'inherit',
    };
    childProcess.spawn('node', args, option);
});

gulp.task('jslint', function () {
    let option = {
        useEslintrc: true,
    };

    return gulp.src([
            './gulpfile.js',
            './client/script/**/*.js',
            './defaults/**/*.js',
            './src/**/*.js',
        ])
        .pipe(eslint(option))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('build:client2', ['jslint'], function () {
    const SRC_JS = ['./client/script/karen.js'];

    let option = {
        insertGlobals: false,
        debug: isRelease ? false : true,
    };

    let babel = babelify.configure({
        optional: [
            'optimisation.react.constantElements',
            // 'optimisation.react.inlineElements', // FIXME: #17
            'utility.deadCodeElimination',
            'utility.inlineEnvironmentVariables',
            'utility.inlineExpressions',
        ],
    });

    browserify(SRC_JS, option)
        .transform(babel)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('client/dist/'));
});

gulp.task('clean:client', function (callback) {
    return del([
        DIST_CLIENT,
    ], callback);
});

gulp.task('build:client', ['__handlebars', '__uglify', '__copy']);
gulp.task('build', ['jslint', 'build:client']);
gulp.task('clean', ['clean:client']);
gulp.task('default', ['build']);
