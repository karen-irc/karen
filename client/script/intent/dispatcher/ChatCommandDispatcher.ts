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

import {ChannelId} from '../../domain/ChannelDomain';
import {NetworkId} from '../../domain/NetworkDomain';
import {User} from '../../domain/User';

type Command = {
    channelId: ChannelId;
    text: string;
};

type Topic = {
    id: ChannelId;
    topic: string;
};

export class ChatCommandDispatcher {

    sendCommand: Rx.Subject<Command>;
    clearMessage: Rx.Subject<ChannelId>;
    setTopic: Rx.Subject<Topic>;
    setNickname: Rx.Subject<{ id: NetworkId, nickname: string }>;
    updateUserList: Rx.Subject<{ channelId: ChannelId, list: Array<User> }>;
    queryWhoIs: Rx.Subject<{ channelId: ChannelId; user: string; }>;
    fetchHiddenLog: Rx.Subject<{ channelId: ChannelId; length: number; }>;

    constructor() {
        this.sendCommand = new Rx.Subject<Command>();

        this.clearMessage = new Rx.Subject<ChannelId>();

        this.setTopic = new Rx.Subject<Topic>();

        this.setNickname = new Rx.Subject<{ id: NetworkId, nickname: string }>();

        this.updateUserList = new Rx.Subject<{ channelId: ChannelId, list: Array<User> }>();

        this.queryWhoIs = new Rx.Subject<{ channelId: ChannelId; user: string; }>();
        this.fetchHiddenLog = new Rx.Subject<{ channelId: ChannelId; length: number; }>();
    }
}
