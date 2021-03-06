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

import {Some, None, Option} from 'option-t';

import {Channel} from './Channel';
import {ChannelId} from './ChannelDomain';
import {Network} from './Network';
import {NetworkId} from './NetworkDomain';

/**
 *  This object is based on the assumption that
 *  `Network.id` will be unique while the runtime.
 */
export class NetworkSet {
    _idMap: Map<NetworkId, Network>;

    constructor(raw: Array<Network>) {
        this._idMap = new Map<NetworkId, Network>();

        raw.forEach((item) => {
            this._idMap.set(item.id, item);
        });
    }

    add(item: Network): void {
        if (this._idMap.has(item.id)) {
            return;
        }

        this._idMap.set(item.id, item);
    }

    getById(id: NetworkId): Option<Network> {
        const result = this._idMap.get(id);
        if (result === undefined) {
            return new None<Network>();
        }
        else {
            return new Some<Network>(result);
        }
    }

    delete(item: Network): boolean {
        const id = item.id;
        const isDeleted = this._idMap.delete(id);
        return isDeleted;
    }

    getChannelById(channelId: ChannelId): Option<Channel> {
        let result: Option<Channel> = new None<Channel>();
        for (const network of this._idMap.values()) {
            // XXX: babel transforms this for-of to try-catch-finally.
            // So we returns here, it start to do 'finally' block
            // and supress to return a value in for-of block.
            const channel = network.getChannelById(channelId);
            if (channel.isSome) {
                result = channel;
                break;
            }
        }

        return result;
    }

    getChannelList(): Array<Channel> {
        let result: Array<Channel> = [];
        for (const network of this._idMap.values()) {
            const list = network.getChannelList();
            result = result.concat(list);
        }
        return result;
    }
}
