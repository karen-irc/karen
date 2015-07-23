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

import {ConnectionActionDispatcher} from '../../intent/dispatcher/ConnectionActionDispatcher';
import {ConnectionValue, NetworkValue, PersonalValue} from '../../domain/value/ConnectionSettings';

export class ConnectionStore {

    private _model: Rx.Observable<ConnectionValue>;

    constructor(intent: ConnectionActionDispatcher) {
        const networkName = intent.setNetworkName.asObservable();
        const serverURL = intent.setServerURL.asObservable();
        const serverPort = intent.setServerPort.asObservable();
        const serverPass = intent.setServerPass.asObservable();
        const useTLS = intent.shouldUseTLS.asObservable().startWith(true);

        const nickname = intent.setNickName.asObservable();
        const username = intent.setUserName.asObservable();
        const realname = intent.setRealName.asObservable();
        const channel = intent.setChannel.asObservable();

        const network = Rx.Observable.combineLatest(
            networkName,
            serverURL,
            serverPort,
            serverPass,
            useTLS,
            function (name, url, port, pass, useTLS) {
                const value = new NetworkValue(name, url, port, pass, useTLS);
                return value;
            }
        );

        const name = Rx.Observable.combineLatest([
            nickname,
            username,
            realname,
            channel,
        ], function (nick, user, real, channel) {
            const value = new PersonalValue(nick, user, real, channel);
            return value;
        });

        const canConnect = Rx.Observable.combineLatest(
            serverURL,
            serverPort,
            nickname,
            function (url, port, nick) {
                return url !== '' && nick !== '';
            }
        ).startWith(false);

        this._model = Rx.Observable.combineLatest(network, name, canConnect, function(network, name, canConnect) {
            const value = new ConnectionValue(network, name, canConnect);
            return value;
        });
    }

    subscribe(observer: Rx.Observer<ConnectionValue>): Rx.IDisposable {
        return this._model.subscribe(observer);
    }
}