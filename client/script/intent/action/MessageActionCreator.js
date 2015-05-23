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

import ChatCommandDispatcher from '../dispatcher/ChatCommandDispatcher';
import CommandTypeMod from '../../model/CommandType';

const CommandType = CommandTypeMod.type;

class MessageActionCreator {
    constructor() {
    }

    /**
     *  @return {ChatCommandDispatcher}
     */
    getDispatcher() {
        return ChatCommandDispatcher;
    }

    /**
     *  @param  {string}  targetId
     *  @param  {string}  command
     *    The command string.
     *  @return {void}
     */
    inputCommand(targetId, command) {
        if ( command.startsWith(CommandType.CLEAR) ) {
            ChatCommandDispatcher.clearMessage.onNext();
            return;
        }

        ChatCommandDispatcher.sendCommand.onNext({
            targetId: targetId,
            text: command,
        });
    }

    /**
     *  @return {void}
     */
    clear() {
        ChatCommandDispatcher.clearMessage.onNext();
    }

    /**
     *  @param  {string}    channelId
     *  @param  {string}    topic
     *  @return {void}
     */
    setTopic(channelId, topic) {
        ChatCommandDispatcher.setTopic.onNext({
            id: channelId,
            topic: topic,
        });
    }

    /**
     *  @param  {string}    id
     *  @return {void}
     */
    quitNetwork(id) {
        ChatCommandDispatcher.quitNetwork.onNext(id);
    }

    /**
     *  @param  {string}    id
     *  @return {void}
     */
    partFromChannel(id) {
        ChatCommandDispatcher.partFromChannel.onNext(id);
    }

    /**
     *  @param  {string}    networkId
     *  @param  {string}    nickname
     *  @return {void}
     */
    setNickname(networkId, nickname) {
        ChatCommandDispatcher.setNickname.onNext({
            id: networkId,
            nickname: nickname,
        });
    }

    /**
     *  @param  {Object}    network
     *  @return {void}
     */
    connectNetwork(network) {
        ChatCommandDispatcher.connectNetwork.onNext(network);
    }

    /**
     *  @param  {number}    channelId
     *  @param  {Array}     list
     *  @return {void}
     */
    updateUserList(channelId, list) {
        ChatCommandDispatcher.updateUserList.onNext({
            channelId,
            list,
        });
    }
}

export default new MessageActionCreator();
