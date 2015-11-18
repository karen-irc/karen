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
/// <reference path="../../../../tsd/third_party/react/react-dom.d.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Rx from 'rx';

import {ConnectSettingWindow} from '../view/ConnectSettingWindow';

import {MessageGateway} from '../../adapter/MessageGateway';
import {ConnectionActionCreator} from '../../intent/action/ConnectionActionCreator';
import {ConnectionStore} from '../viewmodel/ConnectionStore';
import {ConnectionValue} from '../../domain/value/ConnectionSettings';

export class ConnectSettingContext {

    private _mountpoint: Element;

    private _action: ConnectionActionCreator;
    private _store: ConnectionStore;
    private _viewDisposer: Rx.IDisposable;

    constructor(mountpoint: Element, gateway: MessageGateway) {
        if (!mountpoint || !gateway) {
            throw new Error();
        }

        this._mountpoint = mountpoint;
        this._action = new ConnectionActionCreator();
        this._store = new ConnectionStore(this._action.dispatcher(), gateway);

        this._viewDisposer = this._mount();
    }

    dispose(): void {
        this._viewDisposer.dispose();
        this._store.dispose();
        this._action.dispose();
    }

    private _mount(): Rx.IDisposable {
        const observer: Rx.Observer<ConnectionValue> = Rx.Observer.create((data: ConnectionValue) => {
            this._render(data);
        }, ()=> {}, () => {
            ReactDOM.unmountComponentAtNode(this._mountpoint);
        });
        return this._store.subscribe(observer);
    }

    private _render(data: ConnectionValue) {
        const view = React.createElement(ConnectSettingWindow, {
            action: this._action,
            data: data,
        });
        ReactDOM.render(view, this._mountpoint);
    }
}
