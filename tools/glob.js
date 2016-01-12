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

'use strict';

const glob = require('glob');

/**
 *  @param  {Array<string>} srcList
 *      The array which includes a glob pattern string.
 *  @param  {Object=}  options
 *      The `glob`'s `options` argument.
 *  @return {Promise<Array<string>>}
 *      The array which includes a resolved file path string.
 */
function resolveGlobList(srcList, options) {
    if (!Array.isArray(srcList)) {
        throw new TypeError('resolveGlobList: the argument should be `Array<string>`.');
    }

    /** @type   {Array<Promise<Array<string>>>} */
    const srcs = srcList.map(function(pattern){
        return new Promise(function (resolve, reject) {
            glob(pattern, options, function (err, files){
                if (!!err) {
                    reject(err);
                    return;
                }

                resolve(files);
            });
        });
    });

    /** @type   {Promise<Array<string>>}    */
    const fileList = Promise.all(srcs).then(function(args){
        const list = args.reduce(function(a, b) {
            return a.concat(b);
        }, []);
        return list;
    });

    return fileList;
}

module.exports = {
    resolveGlobList,
};
