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
    // For our target browsers, we need not some transforms.
    'transform-es2015-arrow-functions',
    'transform-es2015-block-scoped-functions',
    'transform-es2015-block-scoping',
    'transform-es2015-classes',
    'transform-es2015-computed-properties',
    'check-es2015-constants',
    'transform-es2015-destructuring',
    'transform-es2015-function-name',
    'transform-es2015-modules-commonjs',
    'transform-es2015-object-super',
    'transform-es2015-parameters',
    'transform-es2015-spread',
    'transform-es2015-sticky-regex',
    'transform-es2015-unicode-regex',
    'transform-regenerator',

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
    devtool: isRelease ? '' : 'inline-source-map',

    entry: {
        karen: KAREN_ENTRY_POINT,
    },

    output: {
        path: KAREN_CLIENT_DIST_DIR,
        filename: '[name].js',
    },

    resolve: {
        alias: {},
        root: [],
        extensions: ['', '.js', '.jsx'],
        modulesDirectories: ['node_modules'],
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
