// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
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
