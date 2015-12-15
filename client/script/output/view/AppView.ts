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
import UIActionCreator from '../../intent/action/UIActionCreator';

export class AppView implements EventListenerObject {

    _element: Element;
    _toggleLeftPane: Rx.IDisposable;
    _toggleRightPane: Rx.IDisposable;
    _isOpenedLeftPane: boolean;
    _isOpenedRightPane: boolean;

    constructor(element: Element) {
        this._element = element;

        const uiDispatcher = UIActionCreator.dispatcher();

        this._toggleLeftPane = uiDispatcher.toggleLeftPane.subscribe((shouldOpen) => {
            const className = 'lt';
            const classList = this._element.classList;
            if (shouldOpen) {
                this._isOpenedLeftPane = true;
                classList.add(className);
            }
            else {
                this._isOpenedLeftPane = false;
                classList.remove(className);
            }
        });

        this._toggleRightPane = uiDispatcher.toggleRightPane.subscribe((shouldOpen) => {
            const className = 'rt';
            const classList = this._element.classList;
            if (shouldOpen) {
                this._isOpenedRightPane = true;
                classList.add(className);
            }
            else {
                this._isOpenedRightPane = false;
                classList.remove(className);
            }
        });

        this._isOpenedLeftPane = element.classList.contains('rt');

        this._isOpenedRightPane = element.classList.contains('rt');

        element.addEventListener('click', this);
    }

    handleEvent(aEvent: Event): void {
        switch (aEvent.type) {
            case 'click':
                this.onClick(aEvent);
                break;
        }
    }

    onClick(aEvent: Event): void {
        const target = <Element>aEvent.target;
        if (!(target.localName === 'button')) {
            return;
        }

        if (target.classList.contains('lt')) {
            const shouldOpen = !this._isOpenedLeftPane;
            UIActionCreator.toggleLeftPane(shouldOpen);
        }
        else if (target.classList.contains('rt')) {
            const shouldOpen = !this._isOpenedRightPane;
            UIActionCreator.toggleRightPane(shouldOpen);
        }
    }
}
