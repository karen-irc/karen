/*eslint quote-props: [2, "always"] */

'use strict';

module.exports = {
    'plugins': [],

    'extends': [
        './tools/stylelint/stylelintrc_core.js',
    ],

    // http://stylelint.io/user-guide/rules/
    'rules': {
        'at-rule-empty-line-before': null, // FIXME
        'declaration-no-important': null, // FIXME
        'no-descending-specificity': null, // FIXME
        'selector-no-universal': null, // FIXME
        'property-no-vendor-prefix': null, // FIXME
        'selector-no-vendor-prefix': null, // FIXME
        'selector-pseudo-element-colon-notation': null, // FIXME
    },
};
