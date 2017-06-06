'use strict';

const path = require('path');

const isRelease = process.env.NODE_ENV === 'production';

// XXX: we'd like to pass these values through `process.env`.
// But it would not work on Windows because cross-env v4 escapes `:` in the passed value.
// Then `C://Bar/Foo/` is replaced to `C;//Bar/Foo`. This causes the error which the path is incorrect.
// https://github.com/kentcdodds/cross-env/releases/tag/v4.0.0
// TODO: we may be able to restore the previous code by https://github.com/kentcdodds/cross-env/releases/tag/v5.0.0
const KAREN_ENTRY_POINT = path.resolve(__dirname, './__obj/client/karen.js');
const KAREN_CLIENT_DIST_DIR = path.resolve(__dirname, './__dist/client/');

console.log(`KAREN_ENTRY_POINT: ${KAREN_CLIENT_DIST_DIR}`);
console.log(`KAREN_CLIENT_DIST_DIR: ${KAREN_CLIENT_DIST_DIR}`);

const babelPresets = [
];

let babelPlugins = [
    // esnext
    'transform-async-generator-functions',

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
        'transform-react-jsx-self',
    ]);
}

const parserOpts = {};
const generatorOpts = {
    // retain the parentheses around an IIFE
    // see: https://github.com/nolanlawson/optimize-js
    retainFunctionParens: false,
};

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
            'moment': 'moment',
        }
    ],

    resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.jsx'],
        alias: {},
    },

    module: {
        rules: [
            {
                test: /\.jsx?$/, // loader is applied to files which matches this extensions.
                exclude: /node_modules/, // don't transform under this path.
                loader: 'babel-loader',
                query: {
                    presets: babelPresets,
                    plugins: babelPlugins,
                    parserOpts,
                    generatorOpts,
                }
            }
        ]
    },
};
