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

/// <reference path="../../../../node_modules/rx/ts/rx.d.ts" />

import Channel from '../../model/Channel';
import Network from '../../model/Network';
import * as Rx from 'rx';
import User from '../../model/User';

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
    clearMessage: Rx.Subject<void>;
    setTopic: Rx.Subject<Topic>;
    quitNetwork: Rx.Subject<number>;
    joinChannel: Rx.Subject<{ networkId: number, channel: Channel }>;
    partFromChannel: Rx.Subject<number>;
    setNickname: Rx.Subject<{ id: number, nickname: string }>;
    connectNetwork: Rx.Subject<Network>;
    updateUserList: Rx.Subject<{ channelId: number, list: Array<User> }>;

    constructor() {
        this.sendCommand = new Rx.Subject<Command>();

        this.clearMessage = new Rx.Subject<void>();

        this.setTopic = new Rx.Subject<Topic>();

        this.quitNetwork = new Rx.Subject<number>();

        this.joinChannel = new Rx.Subject<{ networkId: number, channel: Channel }>();

        this.partFromChannel = new Rx.Subject<number>();

        this.setNickname = new Rx.Subject<{ id: number, nickname: string }>();

        this.connectNetwork = new Rx.Subject<Network>();

        this.updateUserList = new Rx.Subject<{ channelId: number, list: Array<User> }>();
    }
}
