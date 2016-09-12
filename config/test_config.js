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

'use strict';

// http://tools.ietf.org/html/rfc6454
class Origin {
    /**
     *  @param  {string}    scheme
     *  @param  {string}    host
     *  @param  {number}    port
     */
    constructor(scheme, host, port) {
        this.scheme = scheme;
        this.host = host;
        this.port = port;

        Object.freeze(this);
    }

    /**
     *  see: http://tools.ietf.org/html/rfc6454#section-6.1
     *  @return {string}
     */
    toString() {
        return this.scheme + '://' + this.host + ':' + this.port;
    }
}

module.exports = Object.freeze({
    origin: Object.freeze({
        FIRST: new Origin('http', 'localhost', 9876),
        SECOND: new Origin('http', 'localhost', 9001),
    }),
});
