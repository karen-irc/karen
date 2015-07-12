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

import Channel from '../../domain/Channel';
import ChatCommandDispatcher from '../dispatcher/ChatCommandDispatcher';
import CommandTypeMod from '../../domain/CommandType';
import User from '../../domain/User';

const CommandType = CommandTypeMod.type;

class MessageActionCreator {

    _dispatcher: ChatCommandDispatcher;

    constructor() {
        this._dispatcher = new ChatCommandDispatcher();
    }

    getDispatcher(): ChatCommandDispatcher {
        return this._dispatcher;
    }

    inputCommand(channelId: number, command: string): void {
        if ( command.startsWith(CommandType.CLEAR) ) {
            this._dispatcher.clearMessage.onNext(undefined);
            return;
        }

        this._dispatcher.sendCommand.onNext({
            channelId: channelId,
            text: command,
        });
    }

    clear(): void {
        this._dispatcher.clearMessage.onNext(undefined);
    }

    setTopic(channelId: string, topic: string): void {
        this._dispatcher.setTopic.onNext({
            id: channelId,
            topic: topic,
        });
    }

    quitNetwork(id: number): void {
        this._dispatcher.quitNetwork.onNext(id);
    }

    joinChannel(networkId: number, channel: Channel): void {
        this._dispatcher.joinChannel.onNext({
            networkId,
            channel,
        });
    }

    partFromChannel(id: number): void {
        this._dispatcher.partFromChannel.onNext(id);
    }

    setNickname(networkId: number, nickname: string): void {
        this._dispatcher.setNickname.onNext({
            id: networkId,
            nickname: nickname,
        });
    }

    updateUserList(channelId: number, list: Array<User>): void {
        this._dispatcher.updateUserList.onNext({
            channelId,
            list,
        });
    }
}

export default new MessageActionCreator();
