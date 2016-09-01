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
import {NetworkId} from './NetworkDomain';

export class Network {
    id: NetworkId;
    nickname: string;
    _channelList: Array<Channel>;

    constructor(raw: any) { // tslint:disable-line:no-any
        this.id = raw.id;

        this.nickname = raw.nick;

        const channelList: Array<Channel> = raw.channels.map((item: Channel) => {
            const channel = new Channel(item, this);
            return channel;
        });

        this._channelList = channelList;
    }

    getLobbyId(): ChannelId {
        for (const channel of this._channelList) {
            if (channel.type === 'lobby') {
                return channel.id;
            }
        }

        throw new Error('cannot find the lobby id');
    }

    getChannelList(): Array<Channel> {
        return this._channelList;
    }

    getChannelById(channelId: ChannelId): Option<Channel> {
        let result: Option<Channel> = new None<Channel>();
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
        channel.bindToNetwork(this);
    }

    removeChannel(channel: Channel): void {
        const index = this._channelList.indexOf(channel);
        this._channelList.splice(index, 1);
    }

    changeNickName(nick: string): void {
        this.nickname = nick;
    }

    quit(): void {
    }
}
