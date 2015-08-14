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

/// <reference path="../../../../node_modules/rx/ts/es6/rx.all.d.ts" />

import AppActionCreator from '../../intent/action/AppActionCreator';
import MessageGateway from '../../adapter/MessageGateway';
import UIActionCreator from '../../intent/action/UIActionCreator';
import * as Rx from 'rx';

export default class FooterViewController implements EventListenerObject {

    _element: Element;
    _signinElement: HTMLElement;
    _signoutElement: HTMLElement;
    _connectElement: HTMLElement;
    _settingElement: HTMLElement;

    _lastSelectedElement: HTMLElement;

    _disposableSignIn: Rx.IDisposable;
    _disposableSignout: Rx.IDisposable;
    _disposableShowConnect: Rx.IDisposable;
    _disposableShowSetting: Rx.IDisposable;
    _disposableSelectChannel: Rx.IDisposable;

    constructor(message: MessageGateway, element: Element) {
        this._element = element;
        this._signinElement = <HTMLElement>element.querySelector('.sign-in');
        this._signoutElement = <HTMLElement>element.querySelector('.sign-out');
        this._connectElement = <HTMLElement>element.querySelector('.connect');
        this._settingElement = <HTMLElement>element.querySelector('.settings');

        this._lastSelectedElement = null;

        this._disposableSignIn = UIActionCreator.getDispatcher().showSignIn.subscribe(() => {
            this.selectElement(this._lastSelectedElement, this._signinElement);
        });

        this._disposableSignout = AppActionCreator.getDispatcher().signout.subscribe(() => {
            this.selectElement(this._lastSelectedElement, this._signoutElement);
        });

        this._disposableShowConnect = Rx.Observable.merge([
            message.showConnectSetting(),
            UIActionCreator.getDispatcher().showConnectSetting,
        ]).subscribe(() => {
            this.selectElement(this._lastSelectedElement, this._connectElement);
        });

        this._disposableShowSetting = UIActionCreator.getDispatcher().showGeneralSetting.subscribe(() => {
            this.selectElement(this._lastSelectedElement, this._settingElement);
        });

        this._disposableSelectChannel = UIActionCreator.getDispatcher().selectChannel.subscribe(() => {
            this.selectElement(this._lastSelectedElement, null);
        });

        element.addEventListener('click', this);
    }

    destroy(): void {
        this._element.removeEventListener('click', this);

        this._disposableSignIn.dispose();
        this._disposableSignout.dispose();
        this._disposableShowConnect.dispose();
        this._disposableShowSetting.dispose();
        this._disposableSelectChannel.dispose();

        this._element = null;
        this._signinElement = null;
        this._signoutElement = null;
        this._connectElement = null;
        this._settingElement = null;
        this._lastSelectedElement = null;
    }

    handleEvent(aEvent: Event): void {
        switch (aEvent.type) {
            case 'click':
                this.onClick(aEvent);
        }
    }

    onClick(aEvent: Event): void {
        const target = <Element>aEvent.target;
        if (target.localName !== 'button') {
            return;
        }

        if (target === this._connectElement) {
            UIActionCreator.showConnectSetting();
        }
        else if (target === this._settingElement) {
            UIActionCreator.showGeneralSetting();
        }
        else if (target === this._signoutElement) {
            AppActionCreator.signout();
        }
        else if (target === this._signinElement) {
            UIActionCreator.showSignIn();
        }
    }

    selectElement(last: HTMLElement, current: HTMLElement): void {
        if (last !== null) {
            this.deactivate(last);
        }

        if (current !== null) {
            this.activate(current);
        }

        this._lastSelectedElement = current;
    }

    deactivate(element: HTMLElement): void {
        element.classList.remove('active');
    }

    activate(element: HTMLElement): void {
        element.classList.add('active');
    }
}
