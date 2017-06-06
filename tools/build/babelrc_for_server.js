/*eslint quote-props: [2, "always"] */

'use strict';

// This object is encoded to `.babelrc` with using `JSON.stringify()`.
module.exports = {
    'presets': [
        'react'
    ],

    'plugins': [
        // For Node.js v6~, we need not some transforms.
        'transform-es2015-modules-commonjs',

        // esnext
        'transform-async-generator-functions',
        'babel-plugin-syntax-dynamic-import',
    ],

    'env': {
        'development': {
            'plugins': [
            ],
        },

        'production': {
            'plugins': [
            ],
        },
    },

    'parserOpts': {},
    'generatorOpts': {}
};
