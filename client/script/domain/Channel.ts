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

import * as Rx from 'rx';
import Message from './Message';
import Network from './Network';
import User from './User';

export default class Channel {
    id: number;
    name: string;
    topic: string;
    type: string;
    _userList: Array<User>;
    _unread: number;
    _messageBuffer: Array<Message>;
    network: Network;

    private __newMessageSubject: Rx.Subject<Message>;
    private __newTopicSubject: Rx.Subject<string>;
    private __updateUserListSubject: Rx.Subject<Array<User>>;

    constructor(raw: any, network: Network = null) {
        this.id = raw.id;

        this.name = raw.name;

        this.topic = raw.topic;

        this.type = raw.type;

        const userList: Array<User> = raw.users.map(function(item: any) {
            const user = new User(item);
            return user;
        });
        this._userList = userList;

        this._unread = raw.unread;

        let messages: Array<Message> = null;
        if (Array.isArray(raw.messages)) {
            messages = raw.messages;
        }
        else {
            messages = [];
        }

        this._messageBuffer = messages;
        this.network = network;

        this.__newMessageSubject = new Rx.Subject<Message>();
        this.__newTopicSubject = new Rx.Subject<string>();
        this.__updateUserListSubject = new Rx.Subject<Array<User>>();
    }

    get unread(): number {
        return this.getUnread();
    }

    get messages(): Array<Message> {
        return this._messageBuffer;
    }

    getUnread(): number {
        return this._unread;
    }

    getUserList(): Array<User> {
        return this._userList;
    }

    bindToNetwork(network: Network): void {
        this.network = network;
    }

    addNewMessage(message: Message): void {
        this.__newMessageSubject.onNext(message);
    }

    updateTopic(topic: string): void {
        this.topic = topic;
        this.__newTopicSubject.onNext(topic);
    }

    updateUserList(list: Array<User>): void {
        this._userList = list;
        this.__updateUserListSubject.onNext(list);
    }

    newMessageStream(): Rx.Observable<Message> {
        return this.__newMessageSubject.asObservable();
    }

    newTopicStream(): Rx.Observable<string> {
        return this.__newTopicSubject.asObservable();
    }

    updatedUserListStream(): Rx.Observable<Array<User>> {
        return this.__updateUserListSubject.asObservable();
    }
}
