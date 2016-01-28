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

import * as cookies from 'cookies-js';
import {Option, Some, None} from 'option-t';

export class CookieDriver {

    _cookie: CookiesStatic;

    /**
     *  @constructor
     */
    constructor() {
        this._cookie = cookies;
    }

    get(key: string): Option<any> {
        const value: string = this._cookie.get(key);

        // By https://github.com/ScottHamper/Cookies/blob/a2b58c5a6f8/src/cookies.js#L41
        if (value === undefined) {
            return new None<any>();
        }

        let result: any = null;
        try {
            result = JSON.parse(value);
        }
        catch (e) {
            return new None<any>();
        }

        return new Some<any>(result);
    }

    set(key: string, value: any, option: CookieOptions = {}): void {
        const encoded = JSON.stringify(value);
        this._cookie.set(key, encoded, option);
    }

    remove(key: string, option: CookieOptions = {}): void {
        this._cookie.expire(key, option);
    }
}
