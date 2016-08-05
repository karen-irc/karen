// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
'use strict';

const gulp = require('gulp');

/**
 *  @param  {Array<string>}  srcList
 *  @param  {string}    toDir
 *  @returns    {NodeJS.ReadWriteStream}
 */
function doCopy(srcList, toDir) {
    return gulp.src(srcList)
        .pipe(gulp.dest(toDir));
}

module.exports = {
    doCopy,
};
