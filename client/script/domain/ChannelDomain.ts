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

/// <reference path="../../../node_modules/rx/ts/rx.all.es6.d.ts" />

import * as Rx from 'rx';

import Channel from './Channel';
import Message from './Message';
import User from './User';

import {MessageGateway} from '../adapter/MessageGateway';

export class ChannelDomain {

    private _data: Channel;
    private _topic: Rx.Observable<string>;
    private _userList: Rx.Observable<Array<User>>;
    private _message: Rx.Observable<Message>;

    constructor(gateway: MessageGateway, data: Channel) {
        this._data = data;

        const filterFn = (data: { channelId: number }) => {
            return data.channelId === this._data.id;
        };

        this._topic = gateway.setTopic().filter(filterFn).map(function(data){
            return data.topic;
        }).do((topic) => {
            this._data.updateTopic(topic);
        }).share();

        this._userList = gateway.updateUserList().filter(filterFn).map(function(data){
            return data.list;
        }).do((list) => {
            this._data.updateUserList(list);
        }).share();

        // TODO: pipe message buffer in `data`
        this._message = gateway.recieveMessage().filter(filterFn).map(function(data){
            return data.message;
        }).share();
    }

    getId(): number {
        return this._data.id;
    }

    getValue(): Channel {
        return this._data;
    }

    updatedTopic(): Rx.Observable<string> {
        return this._topic;
    }

    updatedUserList(): Rx.Observable<Array<User>> {
        return this._userList;
    }

    recievedMessage(): Rx.Observable<Message> {
        return this._message;
    }
}