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

import {UIActionDispatcher} from '../dispatcher/UIActionDispatcher';

import {ChannelId} from '../../domain/ChannelDomain';

class UIActionCreator {

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

    toggleRightPane(shouldOpen: boolean): void {
        this._dispatcher.toggleRightPane.next(shouldOpen);
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

export default new UIActionCreator();