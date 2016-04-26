/**
 * @license MIT License
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

import {Option, Some, None} from 'option-t';

import {LiveAccount} from '../domain/LiveAccount';
import {ClientConnection, SessionId} from '../domain/ClientConnection';

export class ClientConnectionRepository {
    private _sessionMap: Map<SessionId, ClientConnection>;
    private _ownerMap: Map<LiveAccount, Set<ClientConnection>>;

    constructor() {
        this._sessionMap = new Map();
        this._ownerMap = new Map();
    }

    getBySessionId(id: SessionId): Option<ClientConnection> {
        const item: ClientConnection | void = this._sessionMap.get(id);
        if (item === undefined) {
            return new None<ClientConnection>();
        }
        return new Some(item);
    }

    set(item: ClientConnection): void {
        const id = item.id();
        this._sessionMap.set(id, item);

        const owner = item.owner();
        let set: Set<ClientConnection> = this._ownerMap.get(owner);
        if (set === undefined) {
            set = new Set();
        }
        set.add(item);
        this._ownerMap.set(owner, set);
    }
}