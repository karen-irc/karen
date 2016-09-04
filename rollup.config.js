/// <reference path='./typings/index.d.ts'/>

'use strict';

const assert = require('assert');
const path = require('path');

const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');

const isRelease = process.env.NODE_ENV === 'production';

const KAREN_ENTRY_POINT = process.env.KAREN_ENTRY_POINT;
assert.ok(!!KAREN_ENTRY_POINT, 'not found process.env.KAREN_ENTRY_POINT');

const KAREN_CLIENT_DIST_DIR = process.env.KAREN_CLIENT_DIST_DIR;
assert.ok(!!KAREN_CLIENT_DIST_DIR, 'not found process.env.KAREN_CLIENT_DIST_DIR');

const babelPresets = [
];

let babelPlugins = [
    // For our target browsers, we need not some transforms.

    // es2016 level
    'babel-plugin-transform-exponentiation-operator',
    // es2017 level
    'babel-plugin-syntax-trailing-function-commas',
    'babel-plugin-transform-async-to-generator',

    // for React
    'syntax-jsx',
    'transform-react-jsx',

    // some utilitis
    'transform-inline-environment-variables',
    'transform-node-env-inline',

    // to remove duplicated helper methods inserted by babel.
    'external-helpers',
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

            // rollup does not have 'extensions' option,
            // so we need to specify this option at here to import jsx file.
            extensions: ['.js', '.jsx'],
        }),

        // https://github.com/rollup/rollup-plugin-commonjs
        commonjs({
            include: 'node_modules/**',
            ignoreGlobal: true,
        }),

        // https://github.com/rollup/rollup-plugin-babel
        babel({
            exclude: 'node_modules/**',
            presets: babelPresets,
            plugins: babelPlugins,
        }),
    ]
};
