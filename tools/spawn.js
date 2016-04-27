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

const childProcess = require('child_process');

/**
 *  Spawn a child process.
 *
 *  @param  {string}    bin
 *      the same as the 1st argument of `child_process.spwan()`.
 *  @param  {Array}     args
 *      the same as the 2nd argument of `child_process.spwan()`.
 *  @param  {Object}    option
 *      the same as the 3rd argument of `child_process.spwan()`.
 *
 *  @return {Promise}
 */
function spawnChildProcess(bin, args, option) {
    const spawned = new Promise(function(resolve, reject){
        const process = childProcess.spawn(bin, args, option);

        process.on('exit', function(signal) {
            const fn = (signal === 0) ? resolve : reject;
            fn(signal);
        });
    });

    return spawned;
}

module.exports = {
    spawnChildProcess,
};
