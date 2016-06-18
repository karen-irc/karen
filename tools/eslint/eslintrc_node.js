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
