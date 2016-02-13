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

import {ConnectionProgress} from './ConnectionProgress';

export type NetworkId = number;

export class RizeNetworkDomain {

    private _id: NetworkId;
    private _connectionState: Rx.Observable<ConnectionProgress>;
    private _name: string;

    private _value: Rx.Observable<RizeNetworkValue>;

    constructor(id: NetworkId,
                channel: Rx.Subject<RizeNetworkValue>,
                connection: Rx.Observable<[NetworkId, ConnectionProgress]>,
                name: string) {
        this._id = id;
        this._connectionState = connection
            .filter(([id,]) => id === this._id)
            .map(([, connection]) => connection);
        this._name = name;

        this._value = this._connectionState.map((connection: ConnectionProgress) => {
            const value = new RizeNetworkValue(this._id, connection, this._name);
            return value;
        });

        this._value.subscribe((value: RizeNetworkValue) => {
            channel.next(value);
        });
    }

    id(): NetworkId {
        return this._id;
    }
}

export class RizeNetworkValue {

    private _id: NetworkId;
    private _connection: ConnectionProgress;
    private _name: string;

    constructor(id: NetworkId,
                connection: ConnectionProgress,
                name: string) {
        this._id = id;
        this._connection = connection;
        this._name = name;
    }

    id(): NetworkId {
        return this._id;
    }

    connectionProgress(): ConnectionProgress {
        return this._connection;
    }

    nickname(): string {
        return this._name;
    }
}