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

/// <reference path="../../../../node_modules/rx/ts/rx.all.es6.d.ts" />

import * as Rx from 'rx';

import {DomainState} from '../../domain/DomainState';
import MessageActionCreator from '../../intent/action/MessageActionCreator';
import UIActionCreator from '../../intent/action/UIActionCreator';

export class InputBoxViewController {

    private _element: Element;
    private _domain: DomainState;
    private _currentChannelId: number;
    private _textInput: HTMLInputElement;
    private _nickElement: HTMLElement;
    private _disposeFocus: Rx.IDisposable;
    private _disposeSelect: Rx.IDisposable;

    constructor(domain: DomainState, element: Element) {
        this._element = element;
        this._domain = domain;
        this._currentChannelId = -1;
        this._textInput = <HTMLInputElement>element.querySelector('#js-input');
        this._nickElement = <HTMLElement>element.querySelector('#js-nick');

        this._disposeFocus = UIActionCreator.dispatcher().focusInputBox.subscribe(() => {
            this._focusInput();
        });

        this._disposeSelect = domain.getSelectedChannel().subscribe((id: number) => {
            this._currentChannelId;
        });

        this._init();
    }

    private _init(): void {
        this._element.addEventListener('submit', this);
        this._textInput.addEventListener('keydown', this);
    }

    get textInput(): HTMLInputElement {
        return this._textInput;
    }

    handleEvent(aEvent: Event): void {
        switch (aEvent.type) {
            case 'submit':
                this.onSubmit(aEvent);
                break;
            case 'keydown':
                this.onKeydown(<KeyboardEvent>aEvent);
                break;
        }
    }

    onSubmit(aEvent: Event): void {
        aEvent.preventDefault();

        const input = this._textInput;
        const text = input.value;
        const channelId = this._domain.currentTab.channelId;
        const id = channelId.expect('the input box cannot submitted if any channel is not selected');

        // lock input field until dispatching to input command.
        input.readOnly = true;
        MessageActionCreator.inputCommand(id, text);
        input.value = '';
        input.readOnly = false;
    }

    private _focusInput(): void {
        this._textInput.focus();
    }

    onKeydown(aEvent: KeyboardEvent): void {
        if (aEvent.target !== this._textInput) {
            return;
        }

        const pressShiftKey = aEvent.shiftKey;
        const pressCtrlKey = aEvent.ctrlKey;
        const pressMetaKey = aEvent.metaKey;
        if (pressCtrlKey || pressMetaKey) {
            return;
        }

        const keyCode = aEvent.keyCode;
        const key = aEvent.key;
        const isKeyK = (key === 'k' || keyCode === 75); // DOM_VK_K
        const isKeyL = (key === 'l' || keyCode === 76); // DOM_VK_L

        const shouldClear = (isKeyL && pressCtrlKey) ||
                            (isKeyL && pressCtrlKey && pressShiftKey) ||
                            (isKeyK && pressMetaKey);
        if (!shouldClear) {
            return;
        }

        event.preventDefault();
        MessageActionCreator.clear(this._currentChannelId);
    }

    setNickname(nickname: string): void {
        const target = this._nickElement;
        target.textContent = nickname + ':';
    }
}