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

import {ChatCommandDispatcher} from '../dispatcher/ChatCommandDispatcher';
import {ChannelId} from '../../domain/ChannelDomain';
import {CommandType} from '../../domain/CommandType';
import {NetworkId} from '../../domain/NetworkDomain';
import {User} from '../../domain/User';

export class MessageActionCreator {

    private _dispatcher: ChatCommandDispatcher;

    constructor() {
        this._dispatcher = new ChatCommandDispatcher();
    }

    dispatcher(): ChatCommandDispatcher {
        return this._dispatcher;
    }

    inputCommand(channelId: ChannelId, command: string): void {
        const isClearCommand = (typeof command.startsWith === 'function') ?
            command.startsWith(CommandType.CLEAR) :
            (command.indexOf(CommandType.CLEAR) === 0);

        if (isClearCommand) {
            this.clear(channelId);
            return;
        }

        this._dispatcher.sendCommand.next({
            channelId: channelId,
            text: command,
        });
    }

    clear(channelId: ChannelId): void {
        this._dispatcher.clearMessage.next(channelId);
    }

    setTopic(channelId: ChannelId, topic: string): void {
        this._dispatcher.setTopic.next({
            id: channelId,
            topic: topic,
        });
    }

    setNickname(networkId: NetworkId, nickname: string): void {
        this._dispatcher.setNickname.next({
            id: networkId,
            nickname: nickname,
        });
    }

    updateUserList(channelId: ChannelId, list: Array<User>): void {
        this._dispatcher.updateUserList.next({
            channelId,
            list,
        });
    }

    queryWhoIs(channelId: ChannelId, user: string): void {
        this._dispatcher.queryWhoIs.next({
            channelId,
            user,
        });
    }

    fetchHiddenLog(channelId: ChannelId, length: number): void {
        this._dispatcher.fetchHiddenLog.next({
            channelId,
            length,
        });
    }
}
