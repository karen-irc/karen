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
import {AuthRepository} from './adapter/AuthRepository';
import {CookieDriver} from './adapter/CookieDriver';

import {AppActionCreator} from './intent/action/AppActionCreator';
import {MessageActionCreator} from './intent/action/MessageActionCreator';
import {NotificationActionCreator} from './intent/action/NotificationActionCreator';
import {UIActionCreator} from './intent/action/UIActionCreator';

import {NotificationPresenter} from './output/NotificationPresenter';
import {WindowPresenter} from './output/WindowPresenter';
import {SidebarContext} from './output/context/SidebarContext';
import {AppView} from './output/view/AppView';
import {InputBoxView} from './output/view/InputBoxView';
import {MainContentAreaView} from './output/view/MainContentAreaView';
import {SidebarFooterView} from './output/view/SidebarFooterView';

import {ConfigRepository} from './settings/repository/ConfigRepository';
import {GeneralSettingContext} from './settings/context/GeneralSettingContext';

export class RizeClient {
    intent: IntentBundler;

    inputBox: InputBoxView;
    appWindow: WindowPresenter;
    appView: AppView;
    windows: MainContentAreaView;
    footer: SidebarFooterView;
    settings: GeneralSettingContext;
    sidebarView: SidebarContext;

    config: ConfigRepository;
    auth: AuthRepository;
    cookie: CookieDriver;

    private _notify: NotificationPresenter;

    constructor() {
        const intent = new IntentBundler()
        this.intent = intent;

        const cookie = new CookieDriver();
        this.cookie = cookie;
        this.config = new ConfigRepository(cookie);
        this.auth = new AuthRepository(cookie, intent.app.dispatcher().signout);

        this._notify = new NotificationPresenter(this.config, intent.notify, intent.ui);
    }
}

export class IntentBundler {
    app: AppActionCreator;
    notify: NotificationActionCreator;
    ui: UIActionCreator;
    message: MessageActionCreator;

    constructor() {
        this.notify = new NotificationActionCreator();
        this.ui = new UIActionCreator();
        this.message = new MessageActionCreator();
    }
}
