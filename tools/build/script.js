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

const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const path = require('path');

const { getSuffixedCommandName } = require('../platform');
const { spawnChildProcess, assertReturnCode } = require('../spawn');

/**
 *  @param  {string}    srcDir
 *  @param  {string}    distDir
 *  @param  {string}    binName
 *
 *  @returns    {NodeJS.ReadWriteStream}
 */
function buildLegacyLib(srcDir, distDir, binName) {
    return gulp.src(srcDir)
        .pipe(concat(binName))
        .pipe(uglify({
            compress: true,
            preserveComments: 'license',
        }))
        .pipe(gulp.dest(distDir));
}

/**
 *  @param  {string}    cwd
 *  @param  {string}    nodeModDir
 *  @param  {string}    entryPoint
 *  @param  {string}    distDir
 *
 *  @returns    {NodeJS.ReadableStream}
 */
function runLinkerForClient(cwd, nodeModDir, entryPoint, distDir) {
    const bin = path.resolve(nodeModDir, './.bin', getSuffixedCommandName('./webpack'));
    const args = [];
    const option = {
        cwd,
        stdio: 'inherit',
        env: Object.assign(process.env, {
            KAREN_ENTRY_POINT: entryPoint,
            KAREN_CLIENT_DIST_DIR: distDir,
        }),
    };
    return spawnChildProcess(bin, args, option).then(assertReturnCode);
}


/**
 *  @param  {string}    cwd
 *  @param  {string}    npmModDir
 *  @param  {string}    srcDir
 *  @param  {string}    distDir
 *  @param  {boolean}   isRelease
 *  @returns    {Promise<void>}
 */
function compileScriptForServer(cwd, npmModDir, srcDir, distDir, isRelease) {
    const babelPresets = [
    ];

    let babelPlugins = [
        // For Node.js v6~, we need not some transforms.
        'transform-es2015-modules-commonjs',

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

    const args = [
        srcDir,
        '--presets', babelPresets.join(','),
        '--plugins', babelPlugins.join(','),
        '--source-maps', 'inline',
        '--extensions', '.js,.jsx',
        '--out-dir', distDir,
    ];

    const option = {
        cwd,
        stdio: 'inherit',
    };

    const command = getSuffixedCommandName('babel');
    const bin = path.resolve(npmModDir, '.bin', command);
    return spawnChildProcess(bin, args, option).then(assertReturnCode);
}

module.exports = {
    buildLegacyLib,
    runLinkerForClient,
    compileScriptForServer,
};
