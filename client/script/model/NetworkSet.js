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

// babel's `es6.forOf` transform uses `Symbol` and 'Array[Symbol.iterator]'.
import 'core-js/modules/es6.array.iterator';
import 'core-js/es6/symbol';

import arrayFrom from 'core-js/library/fn/array/from';
import Network from './Network';
import Rx from 'rx';

import {Some, None} from 'option-t';

/**
 *  This object is based on the assumption that
 *  `Network.id` will be unique while the runtime.
 */
export default class NetworkSet {

    /**
     *  @constructor
     *  @param  {Array}    raw
     */
    constructor(raw) {
        /** @type   {Map<string, Network>}  */
        this._idMap = new Map();

        raw.forEach((item) => {
            const n = new Network(item);
            this._idMap.set(n.id, n);
        });

        /** @type   {Rx.Subject<Network>}    */
        this._added = new Rx.Subject();

        /** @type   {Rx.Subject<Network>}   */
        this._deleted = new Rx.Subject();

        /** @type   {Rx.Subject<void>}  */
        this._cleared = new Rx.Subject();
    }

    /**
     *  @param  {Network}   item
     *  @return {void}
     */
    add(item) {
        if (this.has(item)) {
            return;
        }

        this._idMap.set(item.id, item);
        this._added.onNext(item);
    }

    /**
     *  @return {Rx.Observable<Network>}
     */
    addedStream() {
        return this._added.asObservable();
    }

    /**
     *  @param  {string}    item
     *  @return {boolean}
     */
    has(item) {
        const id = item.id;
        return this._idMap.has(id);
    }

    /**
     *  @param  {string}    id
     *  @return {OptionT<Network>}
     */
    getById(id) {
        const result = this._idMap.get(id);
        if (result === undefined) {
            return new None();
        }
        else {
            return new Some(result);
        }
    }

    /**
     *  @param  {Network}   item
     *  @return {boolean}
     */
    delete(item) {
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
    clear() {
        this._idMap.clear();
        this._cleared.onNext();
    }

    /**
     *  @return {Rx.Observable<Network>}
     */
    clearedStream() {
        return this._cleared.asObservable();
    }

    /**
     *  @return {Array<Network>}
     */
    asArray() {
        const set = new Set(this._idMap.values());
        const array = arrayFrom(set);
        return array;
    }

    /**
     *  @param  {number}    channelId
     *  @return {!OptionT<Channel>}
     */
    getChannelById(channelId) {
        for (const network of this._idMap.values()) {
            const channel = network.getChannelById(channelId);
            if (channelId.isSome) {
                return channel;
            }
        }

        return new None();
    }

    /**
     *  @return {Array<Channel>}
     */
    getChannelList() {
        let result = [];
        for (const network of this._idMap.values()) {
            const list = network.getChannelList();
            result = result.concat(list);
        }
        return result;
    }
}
