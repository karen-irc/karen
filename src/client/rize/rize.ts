/**
 * @license MIT License
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

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {NotificationService} from './adapter/NotificationService';
import {NotificationAction} from './intent/NotificationAction';

import {RizeNetworkSetDomain, RizeNetworkSetValue} from './domain/NetworkSetDomain';

import {RizeAppView} from './output/view/RizeAppView';

/**
 *  ReInitialiZEd Client
 */
export class RizeClient {

    private _notification: NotificationService;
    private _domain: RizeNetworkSetDomain;

    constructor() {
        const notifyAction = new NotificationAction();
        this._notification = new NotificationService(notifyAction.dispatcher());

        this._domain = new RizeNetworkSetDomain();
        this._domain.getValue().subscribe((data: RizeNetworkSetValue) => {
            console.log(data.value);
        });

        const view = React.createElement(RizeAppView, undefined);
        const mountpoint = document.getElementById('js-mountpoint-app');
        ReactDOM.render(view, mountpoint);
    }
}