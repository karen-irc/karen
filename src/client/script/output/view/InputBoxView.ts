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

import {Option, Some, None} from 'option-t';
import * as Rx from 'rxjs';

import {CommandList} from '../../domain/CommandType';
import {DomainState} from '../../domain/DomainState';
import {Channel} from '../../domain/Channel';
import {ChannelId} from '../../domain/ChannelDomain';
import {User} from '../../domain/User';
import MessageActionCreator from '../../intent/action/MessageActionCreator';
import UIActionCreator from '../../intent/action/UIActionCreator';

const words: Array<string> = CommandList.map(function(item){
    return item.toLowerCase();
});

class InputValue {

    actual: string;
    suggstedIndex: Option<number>;

    constructor(actual: string, suggstedIndex: Option<number>) {
        this.actual = actual;
        this.suggstedIndex = suggstedIndex;
    }
}

export class InputBoxView {

    private _element: Element;
    private _domain: DomainState;
    private _currentNetworkId: number;
    private _currntChannel: Option<Channel>;

    private _textInput: HTMLInputElement;
    private _nickElement: HTMLElement;
    private _disposer: Rx.Subscription;

    private _inputVal: InputValue;
    private _lastSuggestionCache: Array<string>;
    private _isSuggestion: boolean;

    constructor(domain: DomainState, element: Element) {
        this._element = element;
        this._domain = domain;
        this._currentNetworkId = -1;
        this._currntChannel = new None<Channel>();
        this._textInput = <HTMLInputElement>element.querySelector('#js-input');
        this._nickElement = <HTMLElement>element.querySelector('#js-nick');

        const disposer = new Rx.Subscription();
        this._disposer = disposer;


        disposer.add(UIActionCreator.dispatcher().focusInputBox.subscribe(() => {
            this._focusInput();
        }));

        disposer.add(domain.getSelectedChannel().subscribe((id: ChannelId) => {
            const channel = this._domain.networkSet.getChannelById(id);
            const networkId = channel.map(function(channel: Channel){
                return channel.getNetwork().id;
            }).unwrap();

            this._currentNetworkId = networkId;
            this._currntChannel = channel;
        }));

        disposer.add(domain.getNetworkDomain().updatedNickname().subscribe((data) => {
            if (this._currentNetworkId !== data.networkId) {
                return;
            }

            this.setNickname(data.nick);
        }));

        this._inputVal = new InputValue('', new None<number>());
        this._lastSuggestionCache = null;
        this._isSuggestion = false;

        this._init();
    }

    private _init(): void {
        this._element.addEventListener('submit', this);
        this._textInput.addEventListener('keydown', this);
        this._textInput.addEventListener('input', this);
    }

    handleEvent(aEvent: Event): void {
        switch (aEvent.type) {
            case 'submit':
                this.onSubmit(aEvent);
                break;
            case 'keydown':
                this.onKeydown(<KeyboardEvent>aEvent);
                break;
            case 'input':
                this.onInput(aEvent);
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

        const keyCode = aEvent.keyCode;
        const key = aEvent.key;

        const isTabKey = (key === 'Tab' || keyCode === 9); // DOM_VK_TAB
        if (isTabKey) {
            aEvent.preventDefault();
            this.autocomplete();
            return;
        }
        else {
            const pressShiftKey = aEvent.shiftKey;
            const pressCtrlKey = aEvent.ctrlKey;
            const pressMetaKey = aEvent.metaKey;
            if (pressCtrlKey || pressMetaKey) {
                return;
            }

            const isKeyK = (key === 'k' || keyCode === 75); // DOM_VK_K
            const isKeyL = (key === 'l' || keyCode === 76); // DOM_VK_L

            const shouldClear = (isKeyL && pressCtrlKey) ||
                                (isKeyL && pressCtrlKey && pressShiftKey) ||
                                (isKeyK && pressMetaKey);
            if (!shouldClear) {
                return;
            }

            aEvent.preventDefault();
            this.clearLog();
        }
    }

    setNickname(nickname: string): void {
        const target = this._nickElement;
        target.textContent = nickname + ':';
    }

    autocomplete(): void {
        const currentValue = this._inputVal.actual;
        if (currentValue === '') {
            return;
        }

        let index = 0;
        if (this._lastSuggestionCache === null && this._inputVal.suggstedIndex.isNone) {
            const suggestion = this._createSuggestion(currentValue);
            index = 0;

            this._lastSuggestionCache = suggestion;
        }
        else {
            const newly = this._inputVal.suggstedIndex.unwrap() + 1;
            index = (newly > (this._lastSuggestionCache.length - 1)) ? 0 : newly;
        }

        if (this._lastSuggestionCache.length === 0) {
            return;
        }

        this._inputVal = new InputValue(this._inputVal.actual, new Some(index));
        this._isSuggestion = true;
        this._textInput.value = this._lastSuggestionCache[index];
        this._isSuggestion = false;
    }

    clearLog(): void {
        if (this._currntChannel.isNone) {
            return;
        }

        const channel = this._currntChannel.unwrap();
        MessageActionCreator.clear(channel.id);
    }

    onInput(aEvent: Event): void {
        if (this._isSuggestion) {
            return;
        }

        const current = this._textInput.value;
        this._inputVal = new InputValue(current, new None<number>());
        this._lastSuggestionCache = null;
    }

    private _createSuggestion(value: string): Array<string> {
        const candidate = [].concat(words);
        const users: Option<Array<User>> = this._currntChannel.map(function(channel){
            return channel.userList();
        });

        if (users.isSome) {
            for (let user of users.unwrap()) {
                const n = user.nickname;
                candidate.push(n.toLowerCase());
            }
        }

        return candidate.filter(function(word: string, item: string){
            return item.indexOf(word) === 0;
        }.bind(null, value.toLowerCase()));
    }
}