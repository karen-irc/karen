/// <reference path='./typings/index.d.ts'/>
'use strict';

const assert = require('assert');
const path = require('path');

const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const isRelease = process.env.NODE_ENV === 'production';

const KAREN_ENTRY_POINT = process.env.KAREN_ENTRY_POINT;
assert.ok(!!KAREN_ENTRY_POINT, 'not found process.env.KAREN_ENTRY_POINT');

const KAREN_CLIENT_DIST_DIR = process.env.KAREN_CLIENT_DIST_DIR;
assert.ok(!!KAREN_CLIENT_DIST_DIR, 'not found process.env.KAREN_CLIENT_DIST_DIR');

// https://github.com/rollup/rollup/wiki/JavaScript-API
// https://github.com/rollup/rollup/wiki/Command-Line-Interface
module.exports = {
    entry: KAREN_ENTRY_POINT,
    dest: path.resolve(KAREN_CLIENT_DIST_DIR, 'karen.js'),
    format: 'cjs',
    exports: 'none',
    useStrict: true,
    sourceMap: true,
    treeshake: true,

    plugins: [
        // https://github.com/rollup/rollup-plugin-node-resolve
        nodeResolve({
            module: true,
            main: true,
            browser: true, // for browser
            preferBuiltins: false, // linking for browser
        }),

        // https://github.com/rollup/rollup-plugin-commonjs
        commonjs({
            ignoreGlobal: true,
        }),
    ]
};
