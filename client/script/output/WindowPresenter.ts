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

/// <reference path="../../../type/core.d.ts" />
/// <reference path="../../../typings/mousetrap/mousetrap.d.ts" />
/// <reference path="../../../node_modules/option-t/option-t.d.ts" />

import arrayFindIndex from 'core-js/library/fn/array/find-index';
import AppActionCreator from '../intent/action/AppActionCreator';
import Channel from '../model/Channel';
import * as Mousetrap from 'mousetrap';
import UIActionCreator from '../intent/action/UIActionCreator';
import {Option} from 'option-t';

export default class WindowPresenter {

    _domain: any;
    _disposeReload: Rx.IDisposable;
    _disposeFocus: Rx.IDisposable;
    _disposeQuitConfirmDialog: Rx.IDisposable;

    /**
     *  @constructor
     *  @param  {DomainState}   domain
     */
    constructor(domain: any) {
        /** @type   {DomainState}   */
        this._domain = domain;

        /*eslint-disable valid-jsdoc */

        /** @type {Rx.IDisposable} */
        this._disposeReload = AppActionCreator.getDispatcher().reload.subscribe(function () {
            window.onbeforeunload = null;

            location.reload();
        });

        /** @type {Rx.IDisposable} */
        this._disposeFocus = UIActionCreator.getDispatcher().focusWindow.subscribe(function(){
            window.focus();
        });

        /** @type {Rx.IDisposable} */
        this._disposeQuitConfirmDialog = UIActionCreator.getDispatcher().setQuitConfirmDialog.subscribe(() => {
            if (document.body.classList.contains('public')) {
                window.onbeforeunload = this._onBeforeUnload;
            }
        });

        /*eslint-enable*/

        Mousetrap.bind([
            'command+up',
            'command+down',
            'ctrl+up',
            'ctrl+down'
        ], (e, keys) => {
            this.handleShortcut(keys);
        });
    }

    destroy(): void {
        this._domain = null;
        this._disposeReload = null;
        this._disposeFocus = null;
        this._disposeQuitConfirmDialog = null;
    }

    /**
     *  @param  {Event} aEvent
     *  @return {string}
     */
    _onBeforeUnload(aEvent: Event): string {
        // This function is called on `beforeunload` event,
        // we cannnot call window.confirm, alert, prompt during the event.
        // Thus we need to use classical way to show a modal prompt.
        return 'Are you sure you want to navigate away from this page?';
    }

    /**
     *  @param  {string}    keys
     *  @return {void}
     */
    handleShortcut(keys: string): void {
        const direction = keys.split('+').pop();
        const channelList: Array<Channel> = this._domain.networkSet.getChannelList();
        const currentIndex: Option<number> = this._domain.currentTab.channelId.map(function(currentId: number) {
            return arrayFindIndex(channelList, function(channel: Channel){
                return channel.id === currentId;
            });
        });

        if (currentIndex.isNone) {
            return;
        }

        const index = currentIndex.unwrap();
        const length = channelList.length;
        switch (direction) {
            case 'up': {
                // Loop
                const target = (length + (index - 1 + length)) % length;
                const id = channelList[target].id;
                UIActionCreator.selectChannel(id);
                break;
            }

            case 'down': {
                // Loop
                const target = (length + (index + 1 + length)) % length;
                const id = channelList[target].id;
                UIActionCreator.selectChannel(id);
                break;
            }
        }
    }
}
