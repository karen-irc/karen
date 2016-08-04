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

import {ChannelId} from '../../domain/ChannelDomain';

type SettingId = string;

export class UIActionDispatcher {

    toggleLeftPane: Rx.Subject<boolean>;
    focusInputBox: Rx.Subject<void>;
    focusWindow: Rx.Subject<void>;
    selectChannel: Rx.Subject<ChannelId>;
    setQuitConfirmDialog: Rx.Subject<void>;
    showConnectSetting: Rx.Subject<void>;
    showGeneralSetting: Rx.Subject<void>;
    showSignIn: Rx.Subject<void>;

    showLatestInChannel: Rx.Subject<ChannelId>;
    tryCloseChannel: Rx.Subject<ChannelId>;
    toggleInlineImage: Rx.Subject<void>;

    showSomeSettings: Rx.Observable<SettingId>;

    constructor() {
        this.toggleLeftPane = new Rx.Subject<boolean>();

        this.focusInputBox = new Rx.Subject<void>();
        this.focusWindow = new Rx.Subject<void>();

        this.selectChannel = new Rx.Subject<ChannelId>();

        this.setQuitConfirmDialog = new Rx.Subject<void>();

        this.showConnectSetting = new Rx.Subject<void>();
        this.showGeneralSetting = new Rx.Subject<void>();

        this.showSignIn = new Rx.Subject<void>();

        this.showLatestInChannel = new Rx.Subject<ChannelId>();
        this.tryCloseChannel = new Rx.Subject<ChannelId>();
        this.toggleInlineImage = new Rx.Subject<void>();

        this.showSomeSettings = Rx.Observable.merge<SettingId, SettingId>(...[
            this.showSignIn.map(function() { return 'sign-in'; }),
            this.showConnectSetting.map(function() { return 'connect'; }),
            this.showGeneralSetting.map(function() { return 'settings'; }),
        ]);
    }
}
