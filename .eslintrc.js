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
    'extends': 'eslint:recommended',

    'ecmaFeatures': {
        'arrowFunctions': true,
        'blockBindings': true,
        'classes': true,
        'objectLiteralComputedProperties': true,
        'objectLiteralDuplicateProperties': true,
        'objectLiteralShorthandMethods': true,
        'objectLiteralShorthandProperties': true,
        'templateStrings': true,
        'spread': true
    },

    'env': {
        'node': true
    },

    'plugins': [
        'react' // for React/JSX
    ],

    'root': true,

    'rules': {
        // Possible Errors
        'comma-dangle': [0, 'never'],
        'no-constant-condition': 1,
        'no-console': 0,
        'no-debugger': 1,
        'no-extra-boolean-cast': 0,
        'no-extra-parens': 0,
        'no-unexpected-multiline': 1,
        'valid-jsdoc': [2, {
            'requireReturn': true,
            'requireParamDescription': false,
            'requireReturnDescription': false
        }],

        // Best Practices
        'block-scoped-var': 1,
        'curly': 2,
        'no-alert': 1,
        'no-caller': 1,
        'no-case-declarations': 2,
        'no-div-regex': 2,
        'no-empty-pattern': 2,
        'no-eq-null': 2,
        'no-implied-eval': 2,
        'no-invalid-this': 1,
        'no-param-reassign': [1, {
            'props': true
        }],
        'no-throw-literal': 2,
        'no-unused-expressions': 2,
        'no-useless-call': 1,
        'no-useless-concat': 1,
        'radix': 2,

        // Strict Mode
        'strict': [2, 'global'],

        // Variables
        'init-declarations': [2, 'always'],
        'no-shadow': 0,
        'no-unused-vars': 0,
        'no-use-before-define': 0,

        // Node.js
        'global-require': 2,
        'no-mixed-requires': [2, {
            'grouping': true,
        }],
        'no-new-require': 2,
        'no-path-concat': 2,
        'no-process-exit': 0,
        'no-sync': 1, // Bann to use sync method. FIXME: enable this rules as an error.

        // Stylistic Issues
        'comma-spacing': [2, {
            'before': false,
            'after': true
        }],
        'comma-style': [2, 'last'],
        'indent': [2, 4, {
            'SwitchCase': 1
        }],
        'jsx-quotes': [1, 'prefer-single'],
        'linebreak-style': [2, 'unix'],
        'no-array-constructor': 2, // In almost case, we don't have to use `new Array()` without any comments.
        'no-new-object': 2, // In almost case, we don't have to use `new Object()` without any comments.
        'no-mixed-spaces-and-tabs': 2,
        'no-trailing-spaces': 2,
        'no-underscore-dangle': 0,
        'no-unneeded-ternary': 2,
        'operator-linebreak': [2, 'after'],
        'quotes': [2, 'single', 'avoid-escape'],
        'semi': [2, 'always'],
        'space-unary-ops': [2, {
            'words': true,
            'nonwords': false
        }],
        'spaced-comment': 0,

        // ECMAScript 6
        'arrow-body-style': [1, 'as-needed'],
        'arrow-parens': 1,
        'arrow-spacing': [1, {
            'before': true,
            'after': true
        }],
        'constructor-super': 2,
        'generator-star-spacing': [2, {
            'before': false,
            'after': true
        }],
        'no-arrow-condition': 2,
        'no-class-assign': 2,
        'no-const-assign': 2,
        'no-dupe-class-members': 2,
        'no-this-before-super': 2,
        'no-var': 1,
        'object-shorthand': 0,
        'prefer-const': 1,
        'prefer-reflect': 1,
        'prefer-spread': 1,
        'require-yield': 2,

        // ESLint-plugin-React
        // https://github.com/yannickcr/eslint-plugin-react
        'react/display-name': 0, // JSX transpiler creates displayName automatically.
        'react/forbid-prop-types': 0,
        'react/jsx-boolean-value': [2, 'always'], // Force boolean attribute explicitly.
        'react/jsx-closing-bracket-location': 0,
        'react/jsx-curly-spacing': 1,
        'react/jsx-indent-props': 0,
        'react/jsx-key': 1,
        'react/jsx-max-props-per-line': 0,
        'react/jsx-no-bind': 2,
        'react/jsx-no-duplicate-props': 2,
        'react/jsx-no-literals': 0,
        'react/jsx-no-undef': 2,
        'react/jsx-sort-props': 0,
        'react/jsx-sort-prop-types': [0, {
            'callbacksLast': true
        }],
        'react/jsx-uses-react': 1,
        'react/jsx-uses-vars': 1,
        'react/jsx-pascal-case': 2,
        'react/no-danger': 1,
        'react/no-did-mount-set-state': [1, 'allow-in-func'],
        'react/no-did-update-set-state': [1, 'allow-in-func'],
        'react/no-direct-mutation-state': 1,
        'react/no-multi-comp': 0,
        'react/no-set-state': 0,
        'react/no-unknown-property': 2,
        'react/prefer-es6-class': 2,
        'react/prop-types': 1,
        'react/react-in-jsx-scope': 1,
        'react/require-extension': 0,
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
        'react/wrap-multilines': 2
    }
};
