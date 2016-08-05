// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {UIActionDispatcher} from '../dispatcher/UIActionDispatcher';

import {ChannelId} from '../../domain/ChannelDomain';

export class UIActionCreator {

    private _dispatcher: UIActionDispatcher;

    constructor() {
        this._dispatcher = new UIActionDispatcher();
    }

    dispatcher(): UIActionDispatcher {
        return this._dispatcher;
    }

    toggleLeftPane(shouldOpen: boolean): void {
        this._dispatcher.toggleLeftPane.next(shouldOpen);
    }

    focusInputBox(): void {
        this._dispatcher.focusInputBox.next(undefined);
    }

    focusWindow(): void {
        this._dispatcher.focusWindow.next(undefined);
    }

    selectChannel(id: ChannelId): void {
        this._dispatcher.selectChannel.next(id);
    }

    setQuitConfirmDialog(): void {
        this._dispatcher.setQuitConfirmDialog.next(undefined);
    }

    showConnectSetting(): void {
        this._dispatcher.showConnectSetting.next(undefined);
    }

    showGeneralSetting(): void {
        this._dispatcher.showGeneralSetting.next(undefined);
    }

    showSignIn(): void {
        this._dispatcher.showSignIn.next(undefined);
    }

    showLatestInChannel(channelId: ChannelId): void {
        this._dispatcher.showLatestInChannel.next(channelId);
    }

    tryCloseChannel(channelId: ChannelId): void {
        this._dispatcher.tryCloseChannel.next(channelId);
    }

    toggleInlineImage(): void {
        this._dispatcher.toggleInlineImage.next(undefined);
    }
}
