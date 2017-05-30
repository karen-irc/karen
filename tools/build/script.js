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

/// <reference path="../../node_modules/@types/node/index.d.ts" />

'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const { getSuffixedCommandName } = require('../platform');
const { spawnChildProcess, assertReturnCode } = require('../spawn');

const BABEL_OPTION_FOR_SERVER = require('./babelrc_for_server');

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
 *  @returns    {Promise<void>}
 */
function compileScriptForServer(cwd, npmModDir, srcDir, distDir) {
    const generateConfig = generateBabelRc(BABEL_OPTION_FOR_SERVER, srcDir);
    const compile = generateConfig.then(() => {
        const args = [
            srcDir,
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
    });
    return compile;
}

/**
 *  @param  {Object}    options
 *      The options for babel.
 *      This will be transformed to JSON with using `JSON.stringify()`.
 *  @param  {string}    targetDir
 *      The target dir path to emit `.babelrc`.
 *  @returns    {Promise<void>}
 */
function generateBabelRc(options, targetDir) {
    const NAME = '.babelrc';
    const fullpath = path.resolve(targetDir, NAME);

    const writer = promisify(fs.writeFile);

    const json = JSON.stringify(options);
    const result = writer(fullpath, json, {
        encoding: 'utf8',
    });
    return result;
}

module.exports = {
    runLinkerForClient,
    compileScriptForServer,
};
