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

 /// <reference path="../../../../node_modules/rx/ts/rx.all.es6.d.ts" />

import {Option} from 'option-t';
import * as Rx from 'rx';

import {ChannelId} from '../../domain/ChannelDomain';
import {DomainState} from '../../domain/DomainState';
import {Network} from '../../domain/Network';
import {NetworkDomain} from '../../domain/NetworkDomain';

export class SidebarViewState {

    private _list: Array<Network>;
    private _currentId: Option<ChannelId>;

    constructor(list: Array<Network>, currentId: Option<ChannelId>) {
        this._list = list;
        this._currentId = currentId;
    }

    list(): Array<Network> {
        return this._list;
    }

    currentId(): Option<ChannelId> {
        return this._currentId;
    }
}

export class SidebarStore {

    private _updater: Rx.Subject<void>;
    private _disposer: Rx.IDisposable;
    private _networkSet: Set<Network>;
    private _state: Rx.Observable<SidebarViewState>;

    constructor(domain: DomainState) {
        this._updater = new Rx.Subject<void>();

        const disposer = new Rx.CompositeDisposable();
        this._disposer = disposer;

        this._networkSet = new Set<Network>();

        disposer.add(domain.getNetworkDomain().addedNetwork().subscribe((network: NetworkDomain) => {
            const value = network.getValue();
            this._addNetwork(value);
        }));

        disposer.add(domain.getNetworkDomain().removedNetwork().subscribe((network: NetworkDomain) => {
            const value = network.getValue();
            this._removedNetwork(value);
        }));

        disposer.add(domain.getNetworkDomain().joinedChannelAtAll().subscribe((_) => {
            this._updater.onNext(undefined);
        }));

        disposer.add(domain.getNetworkDomain().partedChannelAtAll().subscribe((_) => {
            this._updater.onNext(undefined);
        }));

        const currentId: Rx.Observable<Option<ChannelId>> = domain.getCurrentTab().map((v) => v.channelId);
        this._state = currentId.combineLatest(this._updater, (selectedId) => {
            const array = Array.from(this._networkSet);
            const state = new SidebarViewState(array, selectedId);
            return state;
        });
    }

    subscribe(observer: Rx.Observer<SidebarViewState>): Rx.IDisposable {
        return this._state.subscribe(observer);
    }

    dispose(): void {
        this._disposer.dispose();
        this._updater.dispose();
        this._networkSet.clear();

        this._updater = null;
        this._removedNetwork = null;
        this._disposer = null;
        this._state = null;
    }

    private _addNetwork(network: Network): void {
        this._networkSet.add(network);
        this._updater.onNext(undefined);
    }

    private _removedNetwork(network: Network): void {
        this._networkSet.delete(network);
        this._updater.onNext(undefined);
    }
}
