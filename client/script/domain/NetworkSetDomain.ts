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

/// <reference path="../../../node_modules/typescript/lib/lib.es6.d.ts" />

import {Some, None, Option} from 'option-t';
import * as Rx from 'rxjs';

import {RecievedMessage} from './Message';
import {NetworkSet} from './NetworkSet';
import {ChannelDomain, ChannelId} from './ChannelDomain';
import {NetworkDomain, NetworkId} from './NetworkDomain';

import {MessageGateway} from '../adapter/MessageGateway';

interface InitState {
    domain: Array<NetworkDomain>;
    token: string;
    active: Option<ChannelId|string>;
}

export class NetworkSetDomain {

    legacy: NetworkSet;

    private _updateNick: Rx.Subject<{ networkId: NetworkId; nick: string; }>;
    private _joinedChannel: Rx.Subject<ChannelDomain>;
    private _partedChannel: Rx.Subject<ChannelDomain>;
    private _notableMsgDispatcher: Rx.Subject<RecievedMessage>;
    private _notifiableMsgDispatcher: Rx.Subject<RecievedMessage>;

    private _list: Rx.Observable<Array<NetworkDomain>>;
    private _initialState: Rx.Observable<InitState>;
    private _addedNetwork: Rx.Observable<NetworkDomain>;
    private _removedNetwork: Rx.Observable<Option<NetworkDomain>>;

    private _ignitionDisposable: Rx.Subscription;

    constructor(gateway: MessageGateway) {
        this.legacy = new NetworkSet([]);

        this._updateNick = new Rx.Subject<{ networkId: NetworkId; nick: string; }>();
        this._joinedChannel = new Rx.Subject<ChannelDomain>();
        this._partedChannel = new Rx.Subject<ChannelDomain>();
        this._notableMsgDispatcher = new Rx.Subject<RecievedMessage>();
        this._notifiableMsgDispatcher = new Rx.Subject<RecievedMessage>();

        this._list = gateway.invokeInit().map((data) => {
            return data.networks.map((item) => {
                return new NetworkDomain(gateway,
                                         item,
                                         this._updateNick,
                                         this._joinedChannel,
                                         this._partedChannel,
                                         this._notableMsgDispatcher,
                                         this._notifiableMsgDispatcher);
            });
        }).share();

        this._initialState = gateway.invokeInit().zip(this._list, function (data, domain){
            return {
                domain,
                token: data.token,
                active: data.active,
            };
        }).share();

        this._addedNetwork = gateway.addNetwork().map<NetworkDomain>((network) => {
            const domain = new NetworkDomain(gateway,
                                             network,
                                             this._updateNick,
                                             this._joinedChannel,
                                             this._partedChannel,
                                             this._notableMsgDispatcher,
                                             this._notifiableMsgDispatcher);
            return domain;
        }).combineLatest(this._list, (network: NetworkDomain, list: Array<NetworkDomain>) => {
            this.legacy.add(network.getValue()); // for legacy model.
            list.push(network);
            return [network, list];
        }).map(function([network,]){
            return network;
        }).share();

        this._removedNetwork = gateway.quitNetwork().combineLatest(this._list, (networkId: NetworkId, list: Array<NetworkDomain>) => {
            const target = list.find(function(domain){
                return domain.getId() === networkId;
            });
            if (target === undefined) {
                return new None<NetworkDomain>();
            }

            const index = list.indexOf(target);
            list.splice(index, 1);

            this.legacy.delete(target.getValue());

            return new Some(target);
        }).share();

        this._ignitionDisposable = this._init();
    }

    private _init(): Rx.Subscription {
        const d = new Rx.Subscription();
        d.add(this._list.subscribe());
        d.add(this._addedNetwork.subscribe());
        d.add(this._removedNetwork.subscribe());
        return d;
    }

    dispose(): void {
        this._ignitionDisposable.unsubscribe();
    }

    initialState(): Rx.Observable<InitState> {
        return this._initialState;
    }

    getNetworkList(): Rx.Observable<Array<NetworkDomain>> {
        // XXX: This depends on that the list is a mutable collection.
        // If we make the list a immutable collection, we must update this properly.
        return this._list;
    }

    addedNetwork(): Rx.Observable<NetworkDomain> {
        return this._addedNetwork;
    }

    removedNetwork(): Rx.Observable<NetworkDomain> {
        return this._removedNetwork.flatMap(function(v){
            return v.mapOrElse(function(){
                return Rx.Observable.never<NetworkDomain>();
            }, function(v){
                return Rx.Observable.of(v);
            });
        });
    }

    joinedChannelAtAll(): Rx.Observable<ChannelDomain> {
        return this._joinedChannel;
    }

    partedChannelAtAll(): Rx.Observable<ChannelDomain> {
        return this._partedChannel;
    }

    recievedNotableMessage(): Rx.Observable<RecievedMessage> {
        return this._notableMsgDispatcher;
    }

    recievedNotifiableMessage(): Rx.Observable<RecievedMessage> {
        return this._notifiableMsgDispatcher;
    }

    updatedNickname(): Rx.Observable<{ networkId: NetworkId; nick: string; }> {
        return this._updateNick;
    }
}
