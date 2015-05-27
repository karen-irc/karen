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

/// <reference path="../../../type/cookies.d.ts" />

import cookies from 'cookies-js';

// from https://github.com/ScottHamper/Cookies/blob/master/src/cookies.d.ts
type CookieOptions = {
    path?: string;
    domain?: string;
    expires?: any;
    secure?: boolean;
}

export default class CookieDriver {

    _cookie: any; // Cookies

    /**
     *  @constructor
     */
    constructor() {
        /** @type   {Cookies} */
        this._cookie = cookies;
    }

    /**
     *  @param  {string}    key
     *  @return {*}
     */
    get(key: string): any {
        const value: string = this._cookie.get(key);
        let result: any = null;
        /*eslint-disable no-empty*/
        try {
            result = JSON.parse(value);
        }
        catch (e) {}
        /*eslint-enable*/

        return result;
    }

    /**
     *  @param  {string}    key
     *  @param  {*} value
     *  @param  {Cookies.CookieOptions=}    option
     *  @return {void}
     */
    set(key: string, value: any, option: CookieOptions = {}): void {
        const encoded = JSON.stringify(value);
        this._cookie.set(key, encoded, option);
    }

    /**
     *  @param  {string}    key
     *  @param  {Cookies.CookieOptions=}    option
     *  @return {void}
     */
    remove(key: string, option: CookieOptions = {}): void {
        this._cookie.expire(key, option);
    }
}
