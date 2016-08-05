// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
'use strict';

const path = require('path');

const { getSuffixedCommandName } = require('../platform');
const { spawnChildProcess, assertReturnCode, } = require('../spawn');

/**
 *  @param  {string}    cwd
 *  @param  {string}    nodeModDir
 *  @returns    {Promise<void>}
 */
function runESLint(cwd, nodeModDir) {
    const args = [
        '--ext', '.js,.jsx',
        '.', './**/.eslintrc.js',
    ];

    const option = {
        cwd,
        stdio: 'inherit',
    };

    const command = getSuffixedCommandName('eslint');
    const bin = path.resolve(nodeModDir, '.bin', command);
    return spawnChildProcess(bin, args, option).then(assertReturnCode);
}

/**
 *  @param  {string}    cwd
 *  @param  {string}    nodeModDir
 *  @param  {string}    tsconfig
 *  @returns    {Promise<void>}
 */
function runTSLint(cwd, nodeModDir, tsconfig) {
    const args = [
        '--project',
        tsconfig,
        // '--type-check', // FIXME: #710
    ];

    const option = {
        cwd,
        stdio: 'inherit',
    };

    const command = getSuffixedCommandName('tslint');
    const bin = path.resolve(nodeModDir, '.bin', command);
    return spawnChildProcess(bin, args, option).then(assertReturnCode);
}

module.exports = {
    runESLint,
    runTSLint,
};
