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

/// <reference path="../../../../node_modules/rx/ts/rx.all.es6.d.ts" />

import * as Rx from 'rx';

import {Channel} from '../../domain/Channel';
import {User} from '../../domain/User';

type Command = {
    channelId: number;
    text: string;
};

type Topic = {
    id: string;
    topic: string;
};

export default class ChatCommandDispatcher {

    sendCommand: Rx.Subject<Command>
    clearMessage: Rx.Subject<number>;
    setTopic: Rx.Subject<Topic>;
    setNickname: Rx.Subject<{ id: number, nickname: string }>;
    updateUserList: Rx.Subject<{ channelId: number, list: Array<User> }>;
    queryWhoIs: Rx.Subject<{ channelId: number; user: string; }>;

    constructor() {
        this.sendCommand = new Rx.Subject<Command>();

        this.clearMessage = new Rx.Subject<number>();

        this.setTopic = new Rx.Subject<Topic>();

        this.setNickname = new Rx.Subject<{ id: number, nickname: string }>();

        this.updateUserList = new Rx.Subject<{ channelId: number, list: Array<User> }>();

        this.queryWhoIs = new Rx.Subject<{ channelId: number; user: string; }>();
    }
}
