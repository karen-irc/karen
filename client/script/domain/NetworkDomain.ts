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

/// <reference path="../../../node_modules/option-t/option-t.d.ts" />
/// <reference path="../../../node_modules/rx/ts/rx.all.es6.d.ts" />
/// <reference path="../../../node_modules/typescript/lib/lib.es6.d.ts" />
/// <reference path="../../../tsd/core-js.d.ts" />

// babel's `es6.forOf` transform uses `Symbol` and 'Array[Symbol.iterator]'.
import 'core-js/modules/es6.array.iterator';
import 'core-js/es6/symbol';
import arrayFrom from 'core-js/library/fn/array/from'

import {Some, None, Option} from 'option-t';
import * as Rx from 'rx';

import Channel from './Channel';
import {ChannelDomain} from './ChannelDomain';
import Message from './Message';
import Network from './Network';

import {MessageGateway} from '../adapter/MessageGateway';

export class NetworkDomain {

    private _channels: Map<number, ChannelDomain>;

    private _data: Network;
    private _nickname: Rx.Observable<string>;
    private _joinedChannel: Rx.Observable<ChannelDomain>;
    private _partedChannel: Rx.Observable<ChannelDomain>;

    private _joinedUpdater: Rx.Subject<ChannelDomain>;
    private _partedUpdater: Rx.Subject<ChannelDomain>;
    private _notableMsgDispatcher: Rx.Subject<{ targetId: number; message: Message; }>;

    private _subscribed: Rx.CompositeDisposable;

    constructor(gateway: MessageGateway,
                data: Network,
                joinedUpdater: Rx.Subject<ChannelDomain>,
                partedUpdater: Rx.Subject<ChannelDomain>,
                notableMsgDispatcher: Rx.Subject<{ targetId: number; message: Message; }>) {

        this._channels = new Map();
        for (const channel of data.getChannelList()) {
            const domain = new ChannelDomain(gateway, channel, notableMsgDispatcher);
            this._channels.set(domain.getId(), domain);
        }

        this._data = data;
        this._joinedUpdater = joinedUpdater;
        this._partedUpdater = partedUpdater;
        this._notableMsgDispatcher = notableMsgDispatcher;

        this._nickname = gateway.setNickname().filter((data) => {
            return data.networkId === this._data.id;
        }).map(function(data){
            return data.nickname;
        }).do((nick) => {
            this._data.changeNickName(nick);
        }).share();

        this._joinedChannel = gateway.joinChannel().filter((data) => {
            return data.networkId === this._data.id;
        }).map((data) => {
            const channel = data.channel;
            const domain = new ChannelDomain(gateway, channel, this._notableMsgDispatcher);
            return domain;
        }).do((channel) => {
            this._channels.set(channel.getId(), channel);
            this._data.addChannel(channel.getValue());
        }).share();

        this._partedChannel = gateway.partFromChannel().map((id) => {
            const channel = this._channels.get(id);
            return (channel !== undefined) ? new Some(channel) : new None<ChannelDomain>();
        }).filter(function(channel){
            return channel.isSome;
        }).map(function (channel) {
            return channel.expect('this should be unwrapped safely');
        }).do((channel) => {
            this._channels.delete(channel.getId());
            this._data.removeChannel(channel.getValue());
            channel.dispose();
        }).share();

        this._subscribed = new Rx.CompositeDisposable();
        this._subscribed.add(this._joinedChannel.subscribe((channel) => {
            this._joinedUpdater.onNext(channel);
        }));
        this._subscribed.add(this._partedChannel.subscribe((channel) => {
            this._partedUpdater.onNext(channel);
        }));
    }

    dispose(): void {
        this._data = null;
        this._nickname = null;
        this._joinedChannel = null;
        this._partedChannel = null;

        this._notableMsgDispatcher = null;

        this._subscribed.dispose();
        this._subscribed = null;
    }

    getId(): number {
        return this._data.id;
    }

    getValue(): Network {
        return this._data;
    }

    getChannelDomainList(): Array<ChannelDomain> {
        return arrayFrom(this._channels.values());
    }

    updatedNickname(): Rx.Observable<string> {
        return this._nickname;
    }

    joinedChannel(): Rx.Observable<ChannelDomain> {
        return this._joinedChannel;
    }

    partedChannel(): Rx.Observable<ChannelDomain> {
        return this._partedChannel;
    }
}