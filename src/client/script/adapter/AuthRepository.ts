/*global moment: true */
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

import {Option} from 'option-t';

import {CookieDriver} from './CookieDriver';

declare const moment: any;

const KEY_TOKEN = 'token';
const KEY_USER = 'user';

export class AuthRepository {

    _cookie: CookieDriver;

    constructor(cookie: CookieDriver) {
        /** @type {CookieDriver}  */
        this._cookie = cookie;
    }

    getUser(): Option<string> {
        return this._cookie.get(KEY_USER);
    }

    getToken(): Option<string> {
        return this._cookie.get(KEY_TOKEN);
    }

    setToken(token: string): void {
        this._cookie.set(KEY_TOKEN, token, {
            expires: moment().add(30, 'days').toDate(),
        });
    }

    removeToken(): void {
        this._cookie.remove(KEY_TOKEN);
    }
}
