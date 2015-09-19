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

import {Option, Some, None} from 'option-t';
import * as Rx from 'rx';

import MessageActionCreator from '../intent/action/MessageActionCreator';
import Channel from '../domain/Channel';
import CommandTypeMod from '../domain/CommandType';
import {SelectedTab} from '../domain/DomainState'
import {Message, RecievedMessage} from '../domain/Message';
import Network from '../domain/Network';
import User from '../domain/User';

import {SocketIoDriver} from './SocketIoDriver';

const CommandType = CommandTypeMod.type;

export class MessageGateway {

    private _socket: SocketIoDriver;
    private _disposer: Rx.IDisposable;

    constructor(socket: SocketIoDriver) {
        this._socket = socket;

        const disposer = new Rx.CompositeDisposable();
        this._disposer = disposer;

        const messageDispatcher = MessageActionCreator.getDispatcher();

        disposer.add(messageDispatcher.sendCommand.subscribe(({ channelId, text }) => {
            this._sendCommand(channelId, text);
        }));

        disposer.add(messageDispatcher.queryWhoIs.subscribe(({ channelId, user }) => {
            this._queryWhoIs(channelId, user);
        }));
    }

    showConnectSetting(): Rx.Observable<void> {
        return this._socket.init().filter(function(data){
            return (data.networks.length === 0);
        });
    }

    invokeInit(): Rx.Observable<{ networks: Array<Network>; token: string; active: Option<number|string>; }> {
        return this._socket.init().map(function(data){
            const list = (data.networks.length !== 0) ?
                (<Array<any>>data.networks).map(function(item){
                    return new Network(item);
                }) : [];
            return {
                networks: list,
                token: data.token,
                active: data.active.is_some ? new Some(data.active) : new None<number>(),
            };
        });
    }

    disconnected(): Rx.Observable<void> {
        return Rx.Observable.merge([
            this._socket.connectError(),
            this._socket.disconnect(),
        ]);
    }

    addNetwork(): Rx.Observable<Network> {
        return this._socket.network().map(function(data): Network {
            const network = new Network(data.network);
            return network;
        });
    }

    setNickname(): Rx.Observable<{ networkId: number, nickname: string }> {
        return this._socket.nickname().map(function(data) {
            return {
                networkId: data.network,
                nickname: data.nick,
            };
        });
    }

    updateUserList(): Rx.Observable<{ channelId: number, list: Array<User>}> {
        return this._socket.users().map(function(data){
            const channelId = data.chan;
            const users = data.users.map(function(item: any){
                return new User(item);
            });

            return {
                channelId: channelId,
                list: users,
            };
        });
    }

    setTopic(): Rx.Observable<{ channelId: number, topic: string }> {
        return this._socket.topic().map(function(data) {
            return {
                channelId: data.chan,
                topic: data.topic,
            };
        });
    }

    recieveMessage(): Rx.Observable<RecievedMessage> {
        return this._socket.message().map(function(data){
            return {
                channelId: data.chan,
                message: data.msg,
            };
        });
    }

    joinChannel(): Rx.Observable<{networkId: number; channel: Channel}> {
        return this._socket.join().map(function(data){
            const networkId = data.network;
            const channel = new Channel(data.chan);
            return {
                networkId,
                channel,
            };
        });
    }

    partFromChannel(): Rx.Observable<number> { // channelId
        return this._socket.part().map(function(data){
            return <number>data.chan;
        });
    }

    quitNetwork(): Rx.Observable<number> {
        return this._socket.quit().map(function(data) {
            const id = <number>data.network;
            return id;
        });
    }

    saveCurrentTab(currentTab: SelectedTab): void {
        this._socket.emit('open', currentTab.id);
    }

    private _sendCommand(channelId: number, command: string): void {
        this._socket.emit('input', {
            target: channelId,
            text: command,
        });
    }

    private _queryWhoIs(channelId: number, who: string): void {
        const query = CommandType.WHOIS + ' ' + who;
        this._socket.emit('input', {
            target: channelId,
            text: query,
        });
    }
}
