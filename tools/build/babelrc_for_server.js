/*eslint quote-props: [2, "always"] */

'use strict';

// This object is encoded to `.babelrc` with using `JSON.stringify()`.
module.exports = {
    'presets': [
    ],

    'plugins': [
        // For Node.js v6~, we need not some transforms.
        'transform-es2015-modules-commonjs',

        // esnext
        'transform-async-generator-functions',

        // for React
        'syntax-jsx',
        'transform-react-jsx',
    ],

    'env': {
        'development': {
            'plugins': [
                'transform-react-jsx-source',
                'transform-react-jsx-self',
            ],
        },

        'production': {
            'plugins': [
                'transform-react-constant-elements',
                'transform-react-inline-elements',
            ],
        },
    },

    'parserOpts': {},
    'generatorOpts': {}
};
