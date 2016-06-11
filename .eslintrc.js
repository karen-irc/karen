/**
 * @license MIT License
 *
 * Copyright (c) 2015 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/*eslint quote-props: [2, "always"] */

'use strict';

// ESLint Configuration Files enables to include comments.
// http://eslint.org/docs/configuring/#comments-in-configuration-files
module.exports = {

    'extends': './tools/eslintrc.js',

    'env': {
        'es6': true,
        'node': true,
    },

    'plugins': [
        'node',
        'react' // for React/JSX
    ],

    'root': true,

    'rules': {
        // eslint-plugin-node
        // https://github.com/mysticatea/eslint-plugin-node
        'node/no-deprecated-api': 0,
        'node/no-missing-import': 0, // we cannot use module syntax in node yet.
        'node/no-missing-require': 2,
        'node/no-unpublished-import': 0, // we'd like to check in devDependencies, but this cannot check them.
        'node/no-unpublished-require': 0, // we'd like to check in devDependencies, but this cannot check them.
        'node/no-unsupported-features': 0, // we cover this by 'no-restricted-syntax'.
        'node/shebang': 0,

        // ESLint-plugin-React
        // https://github.com/yannickcr/eslint-plugin-react
        'react/display-name': 0, // JSX transpiler creates displayName automatically.
        'react/forbid-prop-types': 0,
        'react/jsx-boolean-value': [2, 'always'], // Force boolean attribute explicitly.
        'react/jsx-closing-bracket-location': 0,
        'react/jsx-curly-spacing': 1,
        'react/jsx-first-prop-new-line': [1, 'never'],
        'react/jsx-equals-spacing': [1, 'never'],
        'react/jsx-handler-names': [2, {
            'eventHandlerPrefix': 'on', // we need not differ this prefix from `eventHandlerPropPrefix`.
            'eventHandlerPropPrefix': 'on',
        }],
        'react/jsx-indent': [1, 4],
        'react/jsx-indent-props': 0,
        'react/jsx-key': 1,
        'react/jsx-max-props-per-line': 0,
        'react/jsx-no-bind': [2, {
            'ignoreRefs': true,
            'allowArrowFunctions': false,
            'allowBind': false,
        }],
        'react/jsx-no-duplicate-props': 2,
        'react/jsx-no-literals': 0,
        'react/jsx-no-target-blank': 1, // In our usecase, we would not need `window.opener` or the referrer.
        'react/jsx-no-undef': 2,
        'react/jsx-pascal-case': [2, {
            'allowAllCaps': false,
            'ignore': [],
        }],
        'react/jsx-sort-props': 0,
        'react/jsx-space-before-closing': 0, // I don't this is a serious problem.
        'react/jsx-uses-react': 1,
        'react/jsx-uses-vars': 1,
        'react/no-danger': 1,
        'react/no-deprecated': [1, { // Detect deprected styles
            'react': '15.0.0',
        }],
        'react/no-did-mount-set-state': [1, 'allow-in-func'],
        'react/no-did-update-set-state': [1, 'allow-in-func'],
        'react/no-direct-mutation-state': 1,
        'react/no-is-mounted': 2, // Disallow the deprected style
        'react/no-multi-comp': 0,
        'react/no-set-state': 0, // FIXME: Enable this rule as a waring
        'react/no-string-refs': 2, // Disallow the legacy style
        'react/no-unknown-property': 2,
        'react/prefer-es6-class': [2, 'always'],
        'react/prefer-stateless-function': 1,
        'react/prop-types': 1,
        'react/react-in-jsx-scope': 1,
        'react/require-extension': 0,
        'react/require-render-return': 2,
        'react/self-closing-comp': 2,
        'react/sort-comp': [1, {
            'order': [
                'constructor',
                'metadata',
                'rendering',
                'lifecycle',
                'everything-else'
            ],
            'groups': {
                'metadata': [
                    'displayName',
                    'propTypes',
                    'contextTypes',
                    'childContextTypes',
                    'mixins',
                    'getDefaultProps',
                    'getInitialState',
                    'getChildContext'
                ],
                'rendering': [
                    'render',
                    '/^render.+$/'
                ]
            }
        }],
        'react/sort-prop-types': [0, {
            'callbacksLast': true,
            'requiredFirst': true,
        }],
        'react/wrap-multilines': 2
    }
};
