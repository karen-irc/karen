// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
/*eslint quote-props: [2, "always"] */

'use strict';

// ESLint Configuration Files enables to include comments.
// http://eslint.org/docs/configuring/#comments-in-configuration-files
module.exports = {

    'extends': [
        './tools/eslint/eslintrc_core.js',
        './tools/eslint/eslintrc_node.js',
        './tools/eslint/eslintrc_react.js',
    ],

    'env': {
        'es6': true,
        'node': true,
    },

    'root': true,

    'rules': {
    }
};
