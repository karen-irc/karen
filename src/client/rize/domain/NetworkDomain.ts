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

import * as Rx from 'rxjs';

export type NetworkId = number;

export class RizeNetworkDomain {

    private _id: NetworkId;
    private _nickname: string;

    private _value: Rx.Observable<RizeNetworkValue>;

    constructor(id: NetworkId, nickname: string) {
        this._id = id;
        this._nickname = nickname;

        this._value = Rx.Observable.of(new RizeNetworkValue(id, nickname)).share();
    }

    getValue(): Rx.Observable<RizeNetworkValue> {
        return this._value;
    }
}

export class RizeNetworkValue {
    private _id: NetworkId;
    private _nickname: string;

    constructor(id: NetworkId, nickname: string) {
        this._id = id;
        this._nickname = nickname;
    }

    id(): NetworkId {
        return this._id;
    }

    nickname(): string {
        return this._nickname;
    }
}