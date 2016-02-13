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

export type ChannelId = number;

export const enum ChannelType {
    Channel,
    Lobby,
    Query,
}

export class RizeChannelDomain {

    private _id: ChannelId;
    private _type: ChannelType;
    private _value: Rx.Observable<RizeChannelValue>;

    constructor(id: ChannelId,
                type: ChannelType) {
        this._id = id;
        this._type = type;
        this._value = Rx.Observable.of(new RizeChannelValue(id, type)).share();
    }

    getValue(): Rx.Observable<RizeChannelValue> {
        return this._value;
    }
}

export class RizeChannelValue {

    private _id: ChannelId;
    private _type: ChannelType;

    constructor(id: ChannelId,
                type: ChannelType) {
        this._id = id;
        this._type = type;
    }

    id(): ChannelId {
        return this._id;
    }

    type(): ChannelType {
        return this._type;
    }
}
