/*eslint quote-props: [2, "always"], no-magic-numbers: 0 */

'use strict';

const preprocess = [
    'postcss-import',
    'postcss-custom-properties',
];

const postprocess = [
    'autoprefixer'
];

module.exports = {
    // 'input': './src/style/style.css',
    // 'output': './__dist/style/style.css',

    'local-plugins': true,
    'use': [
        ...preprocess,
        ...postprocess,
    ],

    'autoprefixer': {
        'browsers': [
            'Last 1 versions',
        ]
    },
};
