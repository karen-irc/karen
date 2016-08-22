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
import {Subject, Subscription} from 'rxjs';

import {CookieDriver} from './CookieDriver';
import {moment} from '../../lib/interop';

const KEY_TOKEN = 'token';
const KEY_USER = 'user';

export class AuthRepository {

    private _cookie: CookieDriver;
    private _disposer: Subscription;

    constructor(cookie: CookieDriver, signoutAction: Subject<void>) {
        this._cookie = cookie;

        const disposer = new Subscription();
        this._disposer = disposer;

        disposer.add(signoutAction.subscribe(() => {
            this.removeToken();
        }));
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
