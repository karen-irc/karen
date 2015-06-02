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

/// <reference path="../../../node_modules/rx/ts/rx.d.ts" />
/// <reference path="../../../node_modules/typescript/bin/lib.es6.d.ts" />
/// <reference path="../../../tsd/core-js.d.ts" />

// babel's `es6.forOf` transform uses `Symbol` and 'Array[Symbol.iterator]'.
import 'core-js/modules/es6.array.iterator';
import 'core-js/es6/symbol';

import arrayFrom from 'core-js/library/fn/array/from';
import Channel from './Channel';
import Network from './Network';
import * as Rx from 'rx';

import {Some, None, Option} from 'option-t';

/**
 *  This object is based on the assumption that
 *  `Network.id` will be unique while the runtime.
 */
export default class NetworkSet {
    _idMap: Map<number, Network>;
    _added: Rx.Subject<Network>;
    _deleted: Rx.Subject<Network>;
    _cleared: Rx.Subject<void>;

    /**
     *  @constructor
     *  @param  {Array}    raw
     */
    constructor(raw: Array<any>) {
        /** @type   {Map<number, Network>}  */
        this._idMap = new Map<number, Network>();

        raw.forEach((item) => {
            const n = new Network(item);
            this._idMap.set(n.id, n);
        });

        /** @type   {Rx.Subject<Network>}    */
        this._added = new Rx.Subject<Network>();

        /** @type   {Rx.Subject<Network>}   */
        this._deleted = new Rx.Subject<Network>();

        /** @type   {Rx.Subject<void>}  */
        this._cleared = new Rx.Subject<void>();
    }

    /**
     *  @param  {Network}   item
     *  @return {void}
     */
    add(item: Network): void {
        if (this.has(item)) {
            return;
        }

        this._idMap.set(item.id, item);
        this._added.onNext(item);
    }

    /**
     *  @return {Rx.Observable<Network>}
     */
    addedStream(): Rx.Observable<Network> {
        return this._added.asObservable();
    }

    /**
     *  @param  {Network}    item
     *  @return {boolean}
     */
    has(item: Network): boolean {
        const id = item.id;
        return this._idMap.has(id);
    }

    /**
     *  @param  {number}    id
     *  @return {OptionT<Network>}
     */
    getById(id: number): Option<Network> {
        const result = this._idMap.get(id);
        if (result === undefined) {
            return new None<Network>();
        }
        else {
            return new Some<Network>(result);
        }
    }

    /**
     *  @param  {Network}   item
     *  @return {boolean}
     */
    delete(item: Network): boolean {
        const id = item.id;
        const isDeleted = this._idMap.delete(id);
        if (isDeleted) {
            this._deleted.onNext(item);
        }
        return isDeleted;
    }

    /**
     *  @return {Rx.Observable<Network>}
     */
    deletedStream() {
        return this._deleted.asObservable();
    }

    /**
     *  @return {void}
     */
    clear(): void {
        this._idMap.clear();
        this._cleared.onNext(undefined);
    }

    /**
     *  @return {Rx.Observable<void>}
     */
    clearedStream(): Rx.Observable<void> {
        return this._cleared.asObservable();
    }

    /**
     *  @return {Array<Network>}
     */
    asArray(): Array<Network> {
        const set = new Set(this._idMap.values());
        const array = arrayFrom(set);
        return array;
    }

    /**
     *  @param  {number}    channelId
     *  @return {!OptionT<Channel>}
     */
    getChannelById(channelId: number): Option<Channel> {
        let result = new None<Channel>();
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

    /**
     *  @return {Array<Channel>}
     */
    getChannelList(): Array<Channel> {
        let result: Array<Channel> = [];
        for (const network of this._idMap.values()) {
            const list = network.getChannelList();
            result = result.concat(list);
        }
        return result;
    }
}
