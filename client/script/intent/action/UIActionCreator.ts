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

class UIActionCreator {

    private _dispatcher: UIActionDispatcher;

    constructor() {
        this._dispatcher = new UIActionDispatcher();
    }

    dispatcher(): UIActionDispatcher {
        return this._dispatcher;
    }

    toggleLeftPane(shouldOpen: boolean): void {
        this._dispatcher.toggleLeftPane.onNext(shouldOpen);
    }

    toggleRightPane(shouldOpen: boolean): void {
        this._dispatcher.toggleRightPane.onNext(shouldOpen);
    }

    focusInputBox(): void {
        this._dispatcher.focusInputBox.onNext(undefined);
    }

    focusWindow(): void {
        this._dispatcher.focusWindow.onNext(undefined);
    }

    selectChannel(id: number): void {
        this._dispatcher.selectChannel.onNext(id);
    }

    setQuitConfirmDialog(): void {
        this._dispatcher.setQuitConfirmDialog.onNext(undefined);
    }

    showConnectSetting(): void {
        this._dispatcher.showConnectSetting.onNext(undefined);
    }

    showGeneralSetting(): void {
        this._dispatcher.showGeneralSetting.onNext(undefined);
    }

    showSignIn(): void {
        this._dispatcher.showSignIn.onNext(undefined);
    }

    showLatestInChannel(channelId: number): void {
        this._dispatcher.showLatestInChannel.onNext(channelId);
    }

    tryCloseChannel(channelId: number): void {
        this._dispatcher.tryCloseChannel.onNext(channelId);
    }
}

export default new UIActionCreator();