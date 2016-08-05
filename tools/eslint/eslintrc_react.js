// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
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
        'react/forbid-prop-types': 0,
        'react/no-danger': 1,
        'react/no-deprecated': 1, // Detect deprected styles
        'react/no-did-mount-set-state': [1, 'disallow-in-func'],
        'react/no-did-update-set-state': [1, 'disallow-in-func'],
        'react/no-direct-mutation-state': 1,
        'react/no-find-dom-node': 2, // Disallow to use `ReactDOM.findDOMNode()`.
        'react/no-is-mounted': 2, // Disallow the deprected style
        'react/no-multi-comp': 0,
        'react/no-render-return-value': 2,
        'react/no-set-state': 0, // FIXME: Enable this rule as a waring
        'react/no-string-refs': 2, // Disallow the legacy style
        'react/no-unknown-property': 2,
        'react/prefer-es6-class': [2, 'always'],
        'react/prefer-stateless-function': 1,
        'react/prop-types': 1,
        'react/react-in-jsx-scope': 1,
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
                    'render',
                    '/^render.+$/'
                ]
            }
        }],
        'react/sort-prop-types': [0, {
            'callbacksLast': true,
            'requiredFirst': true,
        }],

        // JSX-specific rules
        'react/jsx-boolean-value': [2, 'always'], // Force boolean attribute explicitly.
        'react/jsx-closing-bracket-location': 0,
        'react/jsx-curly-spacing': 1,
        'react/jsx-first-prop-new-line': [1, 'never'],
        'react/jsx-equals-spacing': [1, 'never'],
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
        'react/jsx-wrap-multilines': 2,
    }
};
