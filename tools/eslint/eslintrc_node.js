// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
/*eslint quote-props: [2, "always"] */

'use strict';

module.exports = {

    'plugins': [
        'node',
    ],

    'rules': {
        // eslint-plugin-node
        // https://github.com/mysticatea/eslint-plugin-node
        'node/no-deprecated-api': 1,
        'node/no-missing-import': 0, // we cannot use module syntax in node yet.
        'node/no-missing-require': 2,
        'node/no-unpublished-import': 0, // we'd like to check in devDependencies, but this cannot check them.
        'node/no-unpublished-require': 0, // we'd like to check in devDependencies, but this cannot check them.
        'node/no-unsupported-features': 0, // we cover this by 'no-restricted-syntax'.
        'node/shebang': 0,
    }
};
