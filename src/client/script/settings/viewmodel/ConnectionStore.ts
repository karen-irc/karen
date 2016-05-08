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

import {ReactiveProperty} from '../../lib/ReactiveProperty';

import {MessageGateway} from '../../adapter/MessageGateway';
import {ConnectionActionDispatcher} from '../intent/ConnectionSettingIntent';
import {ConnectionValue, NetworkValue, PersonalValue} from '../domain/value/ConnectionSettings';

export class ConnectionSettingViewModel {

    private _networkName: ReactiveProperty<string>;
    private _serverUrl: ReactiveProperty<string>;
    private _serverPort: ReactiveProperty<number>;
    private _serverPass: ReactiveProperty<string>;
    private _useTLS: ReactiveProperty<boolean>;

    private _nickName: ReactiveProperty<string>;
    private _userName: ReactiveProperty<string>;
    private _realName: ReactiveProperty<string>;
    private _channel: ReactiveProperty<string>;

    constructor() {
        this._networkName = new ReactiveProperty('');
        this._serverUrl = new ReactiveProperty('');
        this._serverPort = new ReactiveProperty(0);
        this._serverPass = new ReactiveProperty('');
        this._useTLS = new ReactiveProperty(true);

        this._nickName = new ReactiveProperty('');
        this._userName = new ReactiveProperty('');
        this._realName = new ReactiveProperty('');
        this._channel = new ReactiveProperty('');
    }

    networkName(): ReactiveProperty<string> {
        return this._networkName;
    }

    serverUrl(): ReactiveProperty<string> {
        return this._serverUrl;
    }

    serverPort(): ReactiveProperty<number> {
        return this._serverPort;
    }

    serverPass(): ReactiveProperty<string> {
        return this._serverPass;
    }

    useTLS(): ReactiveProperty<boolean> {
        return this._useTLS;
    }

    nickname(): ReactiveProperty<string> {
        return this._nickName;
    }

    username(): ReactiveProperty<string> {
        return this._userName;
    }

    realname(): ReactiveProperty<string> {
        return this._realName;
    }

    channel(): ReactiveProperty<string> {
        return this._channel;
    }

    asObservable(): Rx.Observable<ConnectionValue> {
        const network: Rx.Observable<NetworkValue> = Rx.Observable.combineLatest<string, string, number, string, boolean, NetworkValue>(
            this._networkName.asObservable(),
            this._serverUrl.asObservable(),
            this._serverPort.asObservable(),
            this._serverPass.asObservable(),
            this._useTLS.asObservable(),
            function (name: string, url: string, port: number, pass: string, useTLS: boolean) {
                const value = new NetworkValue(name, url, port, pass, useTLS);
                return value;
            }
        );

        const personal: Rx.Observable<PersonalValue> = Rx.Observable.combineLatest<string, string, string, string, PersonalValue>(
            this._nickName.asObservable(),
            this._userName.asObservable(),
            this._realName.asObservable(),
            this._channel.asObservable(),
            function (nick: string, user: string, real: string, channel: string) {
                const value = new PersonalValue(nick, user, real, channel);
                return value;
            });

        const canConnect = Rx.Observable.combineLatest<NetworkValue, PersonalValue, boolean>(
            network,
            personal,
            function (network: NetworkValue, personal: PersonalValue) {
                return (network.url !== '') &&
                       (String(network.port) !== '') &&
                       (personal.nickname !== '');
            }).startWith(false);

        const state = canConnect.withLatestFrom(network, personal, function (canConnect, network, personal) {
            const value = new ConnectionValue(network, personal, canConnect);
            return value;
        });

        return state;
    }
}

export class ConnectionStore {

    private _vm: ConnectionSettingViewModel;
    private _init: Rx.Subscription;
    private _tryConnect: Rx.Subscription;

    constructor(intent: ConnectionActionDispatcher, gateway: MessageGateway) {
        this._vm = new ConnectionSettingViewModel();

        // FIXME: this should be a part of observable chain.
        this._init = gateway.initialConnectionPreset().subscribe((tuple) => {
            const [network, personal]: [NetworkValue, PersonalValue] = tuple;

            this._vm.networkName().setValue(network.name);
            this._vm.serverUrl().setValue(network.url);
            this._vm.serverPort().setValue(network.port);
            this._vm.serverPass().setValue(network.pass);
            this._vm.useTLS().setValue(network.useTLS);

            this._vm.nickname().setValue(personal.nickname);
            this._vm.username().setValue(personal.username);
            this._vm.realname().setValue(personal.realname);
            this._vm.channel().setValue(personal.channel);
        });

        this._tryConnect = intent.tryConnect.subscribe(function(value: ConnectionValue){
            gateway.tryConnect(value);
        });
    }

    viewmodel(): ConnectionSettingViewModel {
        return this._vm;
    }

    subscribe(observer: Rx.Subscriber<ConnectionValue>): Rx.Subscription {
        return this._vm.asObservable().subscribe(observer);
    }

    dispose(): void {
        this._init.unsubscribe();
        this._tryConnect.unsubscribe();
    }
}