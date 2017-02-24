/*eslint quote-props: [2, "always"], no-magic-numbers: 0 */

'use strict';

// https://github.com/michael-ciniawsky/postcss-load-config
module.exports = function (ctx) {
    return {
        'map': ctx.env === 'development' ? { 'inline': false } : false,

        'plugins': {
            // preprocess
            'postcss-import': null,

            // postprocess
            'autoprefixer': {
                'browsers': [
                    'Last 2 versions',
                ]
            },
        },
    };
};
