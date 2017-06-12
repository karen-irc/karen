/// <reference path="../../node_modules/@types/node/index.d.ts" />

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { argv } = require('yargs');

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

(async function main() {
    const TARGET_DIR = argv.targetDir;
    assert.ok(typeof TARGET_DIR, 'string', 'please specify env TARGET_DIR');

    const CONFIGURE_PATH = argv.configPath;
    assert.ok(typeof CONFIGURE_PATH, '', 'please specify env CONFIGURE_PATH');

    const optionObj = module.require(CONFIGURE_PATH);

    try {
        await generateBabelRc(optionObj, TARGET_DIR);
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})().then(console.log, console.error);
