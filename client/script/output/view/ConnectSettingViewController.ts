/*global jQuery:true */
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
/// <reference path="../../../../tsd/third_party/react/react.d.ts"/>
/// <reference path="../../../../tsd/react.d.ts"/>

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Rx from 'rx';

import {ConnectionActionCreator} from '../../intent/action/ConnectionActionCreator';
import {ConnectionStore} from '../viewmodel/ConnectionStore';
import {ConnectionValue} from '../../domain/value/ConnectionSettings';

import {SocketIoDriver} from '../../adapter/SocketIoDriver';

import {ConnectSettingWindow} from './ConnectSettingWindow';

export class ConnectSettingViewController {

    private _element: Element;
    private _socket: SocketIoDriver;

    private _action: ConnectionActionCreator;
    private _disposable: Rx.CompositeDisposable;

    constructor(element: Element, socket: SocketIoDriver) {
        if (!element || !socket) {
            throw new Error();
        }

        this._element = element;
        this._socket = socket;

        const action = new ConnectionActionCreator();
        this._action = action;

        const store = new ConnectionStore(action.dispatcher());

        const observer: Rx.Observer<ConnectionValue> = Rx.Observer.create((data: ConnectionValue) => {
            this.render(data);
        }, ()=> {}, () => {
            React.unmountComponentAtNode(this._element);
        });
        this._disposable = new Rx.CompositeDisposable();
        this._disposable.add( store.subscribe(observer) );

        const initSocket = socket.init().map<Array<any>>(function(data) {
            return data.connections;
        }).subscribeOnNext((data) => {
            const first = data[0];

            action.setNetworkName(first.name);
            action.setServerURL(first.host);
            action.setServerPort(first.port);
            action.setServerPass(first.passward);
            action.shouldUseTLS(first.tls);

            action.setNickName(first.nick);
            action.setUserName(first.username);
            action.setRealName(first.realname);
            action.setChannel(first.join);
        });
        this._disposable.add(initSocket);

        const tryConnect = action.dispatcher().tryConnect.asObservable().subscribeOnNext(function(value){
            const prop = value.toJSON();
            socket.emit('conn', prop);
        });
        this._disposable.add(tryConnect);
    }

    render(data: ConnectionValue) {
        const view = React.createElement(ConnectSettingWindow, {
            action: this._action,
            data: data,
        });
        ReactDOM.render(view, this._element);
    }

    dispose(): void {
        this._disposable.dispose();

        this._element = null;
        this._socket = null;
    }
}
