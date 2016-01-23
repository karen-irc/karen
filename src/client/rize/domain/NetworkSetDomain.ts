/**
 * MIT License
 *
 * Copyright (c) 2016 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2016 Yusuke Suzuki <utatane.tea@gmail.com>
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

import * as Rx from 'rxjs';

import {UIDispatcher} from '../intent/UIAction';

import {ConnectionProgress} from './ConnectionProgress';
import {NetworkId, RizeNetworkDomain, RizeNetworkValue} from './NetworkDomain';

export class RizeNetworkSetDomain {
    private _domainMap: Rx.ConnectableObservable<Map<NetworkId, RizeNetworkDomain>>;
    private _valueMap: Rx.ConnectableObservable<Map<NetworkId, RizeNetworkValue>>;

    constructor(dispatcher: UIDispatcher) {
        const channel = new Rx.Subject<RizeNetworkValue>();

        const succeededConnection: Rx.Observable<[NetworkId, ConnectionProgress]> = dispatcher.successConnection
            .map((id) => [id, ConnectionProgress.Succcess]);
        this._domainMap = addNewNetworkDomain(new Map(), channel, dispatcher.addNetwork, succeededConnection).publishReplay(1);
        this._valueMap = updateNetworkValue(new Map(), channel).publishReplay(1);

        this._domainMap.connect();
        this._valueMap.connect();
    }

    domainMap(): Rx.Observable<RizeNetworkSetValue<RizeNetworkDomain>> {
        return this._domainMap.map((map) => new RizeNetworkSetValue(map)).share();
    }

    valueMap():  Rx.Observable<RizeNetworkSetValue<RizeNetworkValue>> {
        return this._valueMap.map((map) => new RizeNetworkSetValue(map)).share();
    }
}

export class RizeNetworkSetValue<V> {

    private _map: Map<NetworkId, V>;

    constructor(map: Map<NetworkId, V>) {
        this._map = map;
    }

    list(): Array<V> {
        return Array.from(this._map.values());
    }
}

function addNewNetworkDomain(map: Map<NetworkId, RizeNetworkDomain>,
                             updater: Rx.Subject<RizeNetworkValue>,
                             intent: Rx.Observable<string>,
                             updateConnection: Rx.Observable<[NetworkId, ConnectionProgress]>): Rx.Observable<Map<NetworkId, RizeNetworkDomain>> {
    const result = intent.scan<Map<NetworkId, RizeNetworkDomain>>((acc, v) => {
        const id = acc.size;
        const network = new RizeNetworkDomain(id, updater, updateConnection.startWith([id, ConnectionProgress.Loading]), v);
        acc.set(network.id(), network);
        return acc;
    }, map).startWith(map);
    return result.share();
}

function updateNetworkValue(map: Map<NetworkId, RizeNetworkValue>,
                            adding: Rx.Subject<RizeNetworkValue>): Rx.Observable<Map<NetworkId, RizeNetworkValue>> {
    const src = Rx.Observable.of(map);
    const result = adding.withLatestFrom(src, function (value: RizeNetworkValue, map: Map<NetworkId, RizeNetworkValue>) {
        map.set(value.id(), value);
        return map;
    }).startWith(map);
    return result.share();
}