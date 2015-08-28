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
/// <reference path="../../../node_modules/typescript/lib/lib.es6.d.ts" />
/// <reference path="../../../tsd/core-js.d.ts" />

// babel's `es6.forOf` transform uses `Symbol` and 'Array[Symbol.iterator]'.
import 'core-js/modules/es6.array.iterator';
import 'core-js/es6/symbol';

import arrayFrom from 'core-js/library/fn/array/from';
import {Some, None, Option} from 'option-t';
import * as Rx from 'rx';

import Channel from './Channel';
import Network from './Network';
import NetworkSet from './NetworkSet';
import {ChannelDomain} from './ChannelDomain';
import {NetworkDomain} from './NetworkDomain';

import {MessageGateway} from '../adapter/MessageGateway';

interface InitState {
    domain: Array<NetworkDomain>;
    token: string;
    active: number;
}

export class NetworkSetDomain {

    legacy: NetworkSet;

    private _joinedChannel: Rx.Subject<ChannelDomain>;
    private _partedChannel: Rx.Subject<ChannelDomain>;

    private _list: Rx.Observable<Array<NetworkDomain>>;
    private _initialState: Rx.Observable<InitState>;
    private _addedNetwork: Rx.Observable<NetworkDomain>;
    private _removedNetwork: Rx.Observable<Option<NetworkDomain>>;

    private _ignitionDisposable: Rx.IDisposable;

    constructor(gateway: MessageGateway) {
        this.legacy = new NetworkSet([]);

        this._joinedChannel = new Rx.Subject<ChannelDomain>();
        this._partedChannel = new Rx.Subject<ChannelDomain>();

        this._list = gateway.invokeInit().map((data) => {
            return data.networks.map((item) => {
                return new NetworkDomain(gateway, item, this._joinedChannel, this._partedChannel);
            });
        }).share();

        this._initialState = gateway.invokeInit().zip(this._list, function (data, domain){
            return {
                domain,
                token: data.token,
                active: data.active,
            };
        }).share();

        this._addedNetwork = gateway.addNetwork().map((network) => {
            const domain = new NetworkDomain(gateway, network, this._joinedChannel, this._partedChannel);
            return domain;
        }).combineLatest<Array<NetworkDomain>, [NetworkDomain, Array<NetworkDomain>]>(this._list, (network, list) => {
            this.legacy.add(network.getValue()); // for legacy model.
            list.push(network);
            return [network, list];
        }).map(function([network, _]){
            return network;
        }).share();

        this._removedNetwork = gateway.quitNetwork().combineLatest(this._list, (networkId, list) => {
            const target = list.find(function(domain){
                return domain.getId() === networkId;
            });
            if (target == undefined) {
                return new None<NetworkDomain>();
            }

            const index = list.indexOf(target);
            list.splice(index, 0);

            this.legacy.delete(target.getValue());

            return new Some(target);
        }).share();

        this._ignitionDisposable = this._init();
    }

    private _init(): Rx.IDisposable {
        const d = new Rx.CompositeDisposable();
        d.add(this._list.subscribe());
        d.add(this._addedNetwork.subscribe());
        d.add(this._removedNetwork.subscribe());
        return d;
    }

    dispose(): void {
        this._ignitionDisposable.dispose();
    }

    initialState(): Rx.Observable<InitState> {
        return this._initialState;
    }

    addedNetwork(): Rx.Observable<NetworkDomain> {
        return this._addedNetwork;
    }

    removedNetwork(): Rx.Observable<NetworkDomain> {
        return this._removedNetwork.flatMap(function(v){
            return v.mapOrElse(function(){
                return Rx.Observable.never<NetworkDomain>();
            }, function(v){
                return Rx.Observable.just(v);
            })
        });
    }

    joinedChannelAtAll(): Rx.Observable<ChannelDomain> {
        return this._joinedChannel;
    }

    partedChannelAtAll(): Rx.Observable<ChannelDomain> {
        return this._partedChannel;
    }
}
