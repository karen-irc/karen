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

import Channel from '../../model/Channel';
import ChatCommandDispatcher from '../dispatcher/ChatCommandDispatcher';
import CommandTypeMod from '../../model/CommandType';
import User from '../../model/User';

const CommandType = CommandTypeMod.type;

class MessageActionCreator {

    _dispatcher: ChatCommandDispatcher;

    constructor() {
        this._dispatcher = new ChatCommandDispatcher();
    }

    /**
     *  @return {ChatCommandDispatcher}
     */
    getDispatcher(): ChatCommandDispatcher {
        return this._dispatcher;
    }

    /**
     *  @param  {string}  targetId
     *  @param  {string}  command
     *    The command string.
     *  @return {void}
     */
    inputCommand(targetId: string, command: string): void {
        if ( command.startsWith(CommandType.CLEAR) ) {
            this._dispatcher.clearMessage.onNext(undefined);
            return;
        }

        this._dispatcher.sendCommand.onNext({
            targetId: targetId,
            text: command,
        });
    }

    /**
     *  @return {void}
     */
    clear(): void {
        this._dispatcher.clearMessage.onNext(undefined);
    }

    /**
     *  @param  {string}    channelId
     *  @param  {string}    topic
     *  @return {void}
     */
    setTopic(channelId: string, topic: string): void {
        this._dispatcher.setTopic.onNext({
            id: channelId,
            topic: topic,
        });
    }

    /**
     *  @param  {string}    id
     *  @return {void}
     */
    quitNetwork(id: string): void {
        this._dispatcher.quitNetwork.onNext(id);
    }

    /**
     *  @param  {number}    networkId
     *  @param  {Channel}   channel
     *  @return {void}
     */
    joinChannel(networkId: number, channel: Channel): void {
        this._dispatcher.joinChannel.onNext({
            networkId,
            channel,
        });
    }

    /**
     *  @param  {string}    id
     *  @return {void}
     */
    partFromChannel(id: string): void {
        this._dispatcher.partFromChannel.onNext(id);
    }

    /**
     *  @param  {string}    networkId
     *  @param  {string}    nickname
     *  @return {void}
     */
    setNickname(networkId: string, nickname: string): void {
        this._dispatcher.setNickname.onNext({
            id: networkId,
            nickname: nickname,
        });
    }

    /**
     *  @param  {Object}    network
     *  @return {void}
     */
    connectNetwork(network: any): void {
        this._dispatcher.connectNetwork.onNext(network);
    }

    /**
     *  @param  {number}    channelId
     *  @param  {Array}     list
     *  @return {void}
     */
    updateUserList(channelId: number, list: Array<User>): void {
        this._dispatcher.updateUserList.onNext({
            channelId,
            list,
        });
    }
}

export default new MessageActionCreator();
