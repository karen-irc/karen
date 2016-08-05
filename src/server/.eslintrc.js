// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
/*eslint quote-props: [2, "always"], strict: 0 */

'use strict';

// ESLint Configuration Files enables to include comments.
// http://eslint.org/docs/configuring/#comments-in-configuration-files
module.exports = {

    'parserOptions': {
        'ecmaVersion': 6,
        'sourceType': 'module',
        'ecmaFeatures': {
            'jsx': true
        },
    },

    'settings': {
        'node': {
            'tryExtensions': ['.js', '.jsx']
        }
    },

    'rules': {
        // eslint-plugin-node
        // https://github.com/mysticatea/eslint-plugin-node
        'node/no-missing-import': 2,
    },
};
