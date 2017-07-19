/*eslint quote-props: [2, "always"] */

'use strict';

module.exports = {
    'plugins': [],

    'extends': [
        'stylelint-config-standard'
    ],

    // http://stylelint.io/user-guide/rules/
    'rules': {
        // quote
        'font-family-name-quotes': 'always-unless-keyword',
        'function-url-quotes': ['always', {
            // except: ['empty'],
        }],
        'string-quotes': 'single',
        'selector-attribute-quotes': 'always',

        // vendor prefix
        'at-rule-no-vendor-prefix': true,
        'selector-no-vendor-prefix': true,
        'value-no-vendor-prefix': true,
        'media-feature-name-no-vendor-prefix': true,
        'property-no-vendor-prefix': true,

        // avoid unexpeced override.
        'declaration-no-important': true,
        // prevent mixed content.
        'function-url-scheme-whitelist': ['https'],

        'font-weight-notation': 'named-where-possible',
    },
};
