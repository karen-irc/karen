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

import * as Rx from 'rxjs';

import {MessageGateway} from '../../adapter/MessageGateway';
import {ConnectionActionDispatcher} from '../../intent/dispatcher/ConnectionActionDispatcher';
import {ConnectionValue, NetworkValue, PersonalValue} from '../../domain/value/ConnectionSettings';

export class ConnectionStore {

    private _state: Rx.Observable<ConnectionValue>;
    private _init: Rx.IDisposable;
    private _tryConnect: Rx.IDisposable;

    constructor(intent: ConnectionActionDispatcher, gateway: MessageGateway) {
        const network = Rx.Observable.combineLatest(
            intent.setNetworkName,
            intent.setServerURL,
            intent.setServerPort,
            intent.setServerPass,
            intent.shouldUseTLS.startWith(true),
            function (name, url, port, pass, useTLS) {
                const value = new NetworkValue(name, url, port, pass, useTLS);
                return value;
            }
        );

        const personal = Rx.Observable.combineLatest([
            intent.setNickName,
            intent.setUserName,
            intent.setRealName,
            intent.setChannel,
        ], function (nick, user, real, channel) {
            const value = new PersonalValue(nick, user, real, channel);
            return value;
        });

        const canConnect = Rx.Observable.combineLatest(
            network,
            personal,
            function (network, personal) {
                return (network.url !== '') &&
                       (String(network.port) !== '') &&
                       (personal.nickname !== '');
            }
        ).startWith(false);

        this._state = canConnect.withLatestFrom(network, personal, function (canConnect, network, personal) {
            const value = new ConnectionValue(network, personal, canConnect);
            return value;
        });

        // FIXME: this should be a part of observable chain.
        this._init = gateway.initialConnectionPreset().subscribeOnNext(function(tuple){
            const [network, personal]: [NetworkValue, PersonalValue] = tuple;

            intent.setNetworkName.onNext(network.name);
            intent.setServerURL.onNext(network.url);
            intent.setServerPort.onNext(network.port);
            intent.setServerPass.onNext(network.pass);
            intent.shouldUseTLS.onNext(network.useTLS);

            intent.setNickName.onNext(personal.nickname);
            intent.setUserName.onNext(personal.username);
            intent.setRealName.onNext(personal.realname);
            intent.setChannel.onNext(personal.channel);
        });

        this._tryConnect = intent.tryConnect.subscribeOnNext(function(value){
            gateway.tryConnect(value);
        });
    }

    subscribe(observer: Rx.Observer<ConnectionValue>): Rx.IDisposable {
        return this._state.subscribe(observer);
    }

    dispose(): void {
        this._init.dispose();
        this._tryConnect.dispose();

        this._state = null;
        this._init = null;
        this._tryConnect = null;
    }
}