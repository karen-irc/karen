/**
 * MIT License
 *
 * Copyright (c) 2016 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2016 Yusuke Suzuki <utatane.tea@gmail.com>
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

module.exports = {

    'plugins': [
        'react',
    ],

    'settings': {
        'react': {
            'version': '15.0', // used for 'no-deprecated' rule.
        }
    },

    'rules': {
        // ESLint-plugin-React
        // https://github.com/yannickcr/eslint-plugin-react
        'react/display-name': 0, // JSX transpiler creates displayName automatically.
        'react/forbid-component-props': 1,
        'react/forbid-elements': [1, {
            'forbid': [],
        }],
        'react/forbid-foreign-prop-types': 2,
        'react/forbid-prop-types': 0,
        // The index of `Array<T>` is not suitable for `key` props.
        // But this restriction does not prevent that the id for each items is just a sequence number of some list
        // even if a item has an "unique" id. This rule cannot prevent it. meaningless.
        'react/no-array-index-key': 0,
        'react/no-children-prop': 2, // children should be nested between the opening and closing tags.
        'react/no-danger': 1,
        'react/no-danger-with-children': 2,
        'react/no-deprecated': 1, // Detect deprected styles
        'react/no-did-mount-set-state': [1, 'disallow-in-func'],
        'react/no-did-update-set-state': [1, 'disallow-in-func'],
        'react/no-direct-mutation-state': 1,
        'react/no-find-dom-node': 2, // Disallow to use `ReactDOM.findDOMNode()`.
        'react/no-is-mounted': 2, // Disallow the deprected style
        'react/no-multi-comp': 0,
        'react/no-render-return-value': 2,
        'react/no-set-state': 1,
        'react/no-string-refs': 2, // Disallow the legacy style
        'react/no-unescaped-entities': 2,
        'react/no-unknown-property': 2,
        'react/no-unused-prop-types': [0, { // XXX: Disable to avoid mis-detection
            'customValidators': [],
            'skipShapeProps': false,
        }],
        'react/prefer-es6-class': [2, 'always'],
        'react/prefer-stateless-function': [1, {
            'ignorePureComponents': false, // we'll reconsider this option when we begin to use `PureComponent`.
        }],
        'react/prop-types': [1, {
            'skipUndeclared': false,
        }],
        'react/react-in-jsx-scope': 1,
        'react/require-default-props': 0, // This does not resolve the essence of problem.
        'react/require-optimization': [0, {
            'allowDecorators': []
        }],
        'react/require-render-return': 2,
        'react/self-closing-comp': [2, {
            'component': true,
            'html': false,
        }],
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
                    'type-annotations',
                    'render',
                    '/^render.+$/'
                ]
            }
        }],
        'react/sort-prop-types': [0, {
            'callbacksLast': true,
            'requiredFirst': true,
        }],
        'react/style-prop-object': 2,
        'react/void-dom-elements-no-children': 1,


        // JSX-specific rules
        'react/jsx-boolean-value': [2, 'always'], // Force boolean attribute explicitly.
        'react/jsx-closing-bracket-location': 0,
        'react/jsx-curly-spacing': 1,
        'react/jsx-equals-spacing': [1, 'never'],
        'react/jsx-first-prop-new-line': [1, 'never'],
        'react/jsx-filename-extension': [2, {
            'extensions': ['.jsx', '.tsx'],
        }],
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
        'react/jsx-no-comment-textnodes': 1,
        'react/jsx-no-duplicate-props': 2,
        'react/jsx-no-literals': 1,
        'react/jsx-no-target-blank': 1, // In our usecase, we would not need `window.opener` or the referrer.
        'react/jsx-no-undef': 2,
        'react/jsx-pascal-case': [2, {
            'allowAllCaps': false,
            'ignore': [],
        }],
        'react/jsx-sort-props': 0,
        'react/jsx-space-before-closing': 0, // I don't this is a serious problem.
        'react/jsx-tag-spacing': [1, {
            'closingSlash': 'never',
            'beforeSelfClosing': 'allow', // Allow to write more XML-ly
            'afterOpening': 'never',
        }],
        'react/jsx-uses-react': 1,
        'react/jsx-uses-vars': 1,
        'react/jsx-wrap-multilines': 2,
    }
};
