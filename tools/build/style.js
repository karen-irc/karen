// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
'use strict';

const autoprefixer = require('autoprefixer');
const gulp = require('gulp');
const postcss = require('gulp-postcss');

/**
 *  @param  {string}    entryPoint
 *  @param  {string}    distDir
 *  @returns    {NodeJS.ReadWriteStream}
 */
function buildCSS(entryPoint, distDir) {
    const processors = [
        autoprefixer({
            browsers: ['last 1 versions'],
            remove: false,
        }),
    ];

    return gulp.src(entryPoint)
        .pipe(postcss(processors))
        .pipe(gulp.dest(distDir));
}

module.exports = {
    buildCSS,
};
