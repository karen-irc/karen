/// <reference path='./typings/index.d.ts'/>

'use strict';

const assert = require('assert');

const isRelease = process.env.NODE_ENV === 'production';

const KAREN_ENTRY_POINT = process.env.KAREN_ENTRY_POINT;
assert.ok(!!KAREN_ENTRY_POINT, 'not found process.env.KAREN_ENTRY_POINT');

const KAREN_CLIENT_DIST_DIR = process.env.KAREN_CLIENT_DIST_DIR;
assert.ok(!!KAREN_CLIENT_DIST_DIR, 'not found process.env.KAREN_CLIENT_DIST_DIR');

const babelPresets = [
];

let babelPlugins = [
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

module.exports = {
    bail: true,

    devtool: isRelease ? '' : 'source-map',

    entry: {
        karen: KAREN_ENTRY_POINT,
    },

    output: {
        path: KAREN_CLIENT_DIST_DIR,
        filename: '[name].js',
    },

    externals: [
        {
            'moment': true,
        }
    ],

    resolve: {
        modules: ['node_modules'],
        extensions: ['', '.js', '.jsx'],
        alias: {},
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/, // loader is applied to files which matches this extensions.
                exclude: /node_modules/, // don't transform under this path.
                loader: 'babel-loader',
                query: {
                    presets: babelPresets,
                    plugins: babelPlugins,
                }
            }
        ]
    },
};
