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

import arrayFindIndex from 'core-js/library/fn/array/find-index';
import AppActionCreator from '../intent/action/AppActionCreator';
import Mousetrap from 'mousetrap';
import UIActionCreator from '../intent/action/UIActionCreator';

export default class WindowPresenter {

    /**
     *  @constructor
     *  @param  {DomainState}   domain
     */
    constructor(domain) {
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
        UIActionCreator.getDispatcher().setQuitConfirmDialog.subscribe(() => {
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

    /**
     *  @param  {Event} aEvent
     *  @return {void}
     */
    _onBeforeUnload(aEvent) {
        // This function is called on `beforeunload` event,
        // we cannnot call window.confirm, alert, prompt during the event.
        // Thus we need to use classical way to show a modal prompt.
        return 'Are you sure you want to navigate away from this page?';
    }

    /**
     *  @param  {string}    keys
     *  @return {void}
     */
    handleShortcut(keys) {
        const direction = keys.split('+').pop();
        const channelList = this._domain.networkSet.getChannelList();
        const currentIndex = this._domain.currentTab.channelId.map(function(currentId) {
            return arrayFindIndex(channelList, function(channel){
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
