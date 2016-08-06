/**
 * MIT License
 *
 * Copyright (c) 2016 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2016 Yusuke Suzuki <utatane.tea@gmail.com>
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
const gulp = require('gulp');
const postcss = require('gulp-postcss');

const atImport = require('postcss-import');
const customProperties = require('postcss-custom-properties');

/**
 *  @param  {string}    entryPoint
 *  @param  {string}    distDir
 *  @returns    {NodeJS.ReadWriteStream}
 */
function buildCSS(entryPoint, distDir) {
    // These paths output a style sheets which latest browosers can load correctly.
    const preprocess = [
        atImport(),
        customProperties,
    ];

    // These paths compile with adding polyfill, inlining images or minifying a file.
    const postprocess = [
        autoprefixer({
            browsers: ['last 1 versions'],
            remove: false,
        }),
    ];

    return gulp.src(entryPoint)
        .pipe(postcss([
            ...preprocess,
            ...postprocess,
        ]))
        .pipe(gulp.dest(distDir));
}

module.exports = {
    buildCSS,
};
