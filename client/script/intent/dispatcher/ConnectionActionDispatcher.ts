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

/// <reference path="../../../../node_modules/rx/ts/es6/rx.all.d.ts" />

import * as Rx from 'rx';

import {ConnectionValue} from '../../domain/value/ConnectionSettings';

export class ConnectionActionDispatcher {

    setNetworkName: Rx.Subject<string>;
    setServerURL: Rx.Subject<string>;
    setServerPort: Rx.Subject<number>;
    setServerPass: Rx.Subject<string>;
    shouldUseTLS: Rx.Subject<boolean>;

    setNickName: Rx.Subject<string>;
    setUserName: Rx.Subject<string>;
    setRealName: Rx.Subject<string>;
    setChannel: Rx.Subject<string>;

    tryConnect: Rx.Subject<ConnectionValue>;

    constructor() {
        this.setNetworkName = new Rx.Subject<string>();
        this.setServerURL = new Rx.Subject<string>();
        this.setServerPort = new Rx.Subject<number>();
        this.setServerPass = new Rx.Subject<string>();
        this.shouldUseTLS = new Rx.Subject<boolean>();

        this.setNickName = new Rx.Subject<string>();
        this.setUserName = new Rx.Subject<string>();
        this.setRealName = new Rx.Subject<string>();
        this.setChannel = new Rx.Subject<string>();

        this.tryConnect = new Rx.Subject<ConnectionValue>();

        Object.seal(this);
    }
}
