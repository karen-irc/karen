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

/// <reference path="../../../node_modules/option-t/option-t.d.ts" />
/// <reference path="../../../node_modules/rx/ts/rx.all.es6.d.ts" />

import * as Rx from 'rx';
// babel's `es6.forOf` transform uses `Symbol` and 'Array[Symbol.iterator]'.
import 'core-js/modules/es6.array.iterator';
import 'core-js/es6/symbol';

import Channel from './Channel';
import {Some, None, Option} from 'option-t';

export default class Network {
    id: number;
    nickname: string;
    _channelList: Array<Channel>;

    private __addedChannelSubject: Rx.Subject<Channel>;
    private __removedChannelSubject: Rx.Subject<Channel>;
    private __changedNicknameSubject: Rx.Subject<string>;

    constructor(raw: any) {
        this.id = raw.id;

        this.nickname = raw.nick;

        const channelList: Array<Channel> = raw.channels.map((item: Channel) => {
            const channel = new Channel(item, this);
            return channel;
        });

        this._channelList = channelList;

        this.__addedChannelSubject = new Rx.Subject<Channel>();
        this.__removedChannelSubject = new Rx.Subject<Channel>();
        this.__changedNicknameSubject = new Rx.Subject<string>();
    }

    /**
     *  @deprecated
     */
    get nick(): string {
        return this.nickname;
    }

    /**
     *  @deprecated
     */
    get channels(): Array<Channel> {
        return this.getChannelList();
    }

    getChannelList(): Array<Channel> {
        return this._channelList;
    }

    getChannelById(channelId: number): Option<Channel> {
        let result = new None<Channel>();
        for (const channel of this._channelList) {
            // XXX: babel transforms this for-of to try-catch-finally.
            // So we returns here, it start to do 'finally' block
            // and supress to return a value in for-of block.
            if (channel.id === channelId) {
                result = new Some(channel);
                break;
            }
        }

        return result;
    }

    addChannel(channel: Channel): void {
        this._channelList.push(channel);
        this.__addedChannelSubject.onNext(channel);
    }

    removeChannel(channel: Channel): void {
        const index = this._channelList.indexOf(channel);
        this._channelList.slice(index, 0);
        this.__removedChannelSubject.onNext(channel);
    }

    changeNickName(nick: string): void {
        this.nickname = nick;
        this.__changedNicknameSubject.onNext(nick);
    }

    quit(): void {
    }

    addedChannelStream(): Rx.Observable<Channel> {
        return this.__addedChannelSubject.asObservable();
    }

    removedChannelStream(): Rx.Observable<Channel> {
        return this.__removedChannelSubject.asObservable();
    }

    changedNickStream(): Rx.Observable<string> {
        return this.__changedNicknameSubject.asObservable();
    }
}
