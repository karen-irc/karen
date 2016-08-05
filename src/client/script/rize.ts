// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
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
        const intent = new IntentBundler();
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
        this.app = new AppActionCreator();
        this.notify = new NotificationActionCreator();
        this.ui = new UIActionCreator();
        this.message = new MessageActionCreator();
    }
}
