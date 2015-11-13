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
const glob = require('./utils/glob');
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
    path.resolve(NPM_MOD_DIR, './urijs/src/URI.js'),
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

    const babelPresets = [
    ];

    let babelPlugins = [
        // For our target browsers, we need not some transforms.
        'transform-es2015-arrow-functions',
        'transform-es2015-block-scoped-functions',
        'transform-es2015-block-scoping',
        'transform-es2015-classes',
        'transform-es2015-computed-properties',
        'check-es2015-constants',
        'transform-es2015-destructuring',
        'transform-es2015-function-name',
        'transform-es2015-literals',
        'transform-es2015-modules-commonjs',
        'transform-es2015-object-super',
        'transform-es2015-parameters',
        'transform-es2015-shorthand-properties',
        'transform-es2015-spread',
        'transform-es2015-sticky-regex',
        'transform-es2015-typeof-symbol',
        'transform-es2015-unicode-regex',
        'transform-regenerator',

        // for React
        'syntax-jsx',
        'transform-react-jsx',

        // some utilitis
        'transform-inline-environment-variables',
        'transform-node-env-inline',
    ];
    if (isRelease) {
        babelPlugins = babelPlugins.concat([
            'transform-react-constant-elements',
            'transform-react-inline-elements',
        ]);
    }
    else {
        babelPlugins = babelPlugins.concat([
            'transform-react-jsx-source',
        ]);
    }

    const babel = babelify.configure({
        presets: babelPresets,
        plugins: babelPlugins,
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
    const SRC = [
        './client/**/*.@(ts|tsx)',
        './server/**/*.@(ts|tsx)',
    ];

    return glob.resolveGlobList(SRC).then(function(list){
        const bin = path.resolve(NPM_MOD_DIR, './tslint', './bin', './tslint-cli.js');

        const args = [
            bin,
        ].concat(list);

        const option = {
            cwd: path.relative(__dirname, ''),
            stdio: 'inherit',
        };

        return spawnChildProcess('node', args, option);
    });
});

gulp.task('__babel:server', ['clean:server'], function () {
    const babelPresets = [
    ];

    let babelPlugins = [
        // For Node.js v5~, we need not some transforms.
        'transform-es2015-destructuring',
        'transform-es2015-modules-commonjs',
        'transform-es2015-parameters',
        'transform-es2015-sticky-regex',
        'transform-es2015-unicode-regex',

        // for React
        'syntax-jsx',
        'transform-react-jsx',
    ];
    if (isRelease) {
        babelPlugins = babelPlugins.concat([
            'transform-react-constant-elements',
            'transform-react-inline-elements',
        ]);
    }
    else {
        babelPlugins = babelPlugins.concat([
            'transform-react-jsx-source',
        ]);
    }

    return gulp.src(SERVER_SRC)
        .pipe(babel({
            presets: babelPresets,
            plugins: babelPlugins,
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
gulp.task('tsc', ['__typescript']);
gulp.task('build:server', ['jslint', '__build:server']);
gulp.task('build:client', ['jslint', '__build:client:js', '__build:client:css']);
gulp.task('build', ['build:server', 'build:client']);
gulp.task('clean:client', ['__clean:client:js', '__clean:client:css']);
gulp.task('clean', ['clean:client', 'clean:server']);
gulp.task('default', ['build']);
