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

import NotificationActionCreator from '../../intent/action/NotificationActionCreator';
import SettingActionCreator from '../../intent/action/SettingActionCreator';
import {SettingStore} from '../viewmodel/SettingStore';

export class GeneralSettingView implements EventListenerObject {

    _element: Element;
    _playElement: Element;
    _disposeStore: Rx.IDisposable;

    constructor(element: Element, store: SettingStore) {
        this._element = element;

        this._playElement = element.querySelector('#play');

        const observer = Rx.Observer.create((option: { name: string; value: any; }) => {
            this.updateState(option);
        });
        this._disposeStore = store.subscribe(observer);

        element.addEventListener('change', this);
        this._playElement.addEventListener('click', this);
    }

    handleEvent(aEvent: Event): void {
        switch (aEvent.type) {
            case 'change':
                this.onChange(aEvent);
                break;
            case 'click':
                this.onClick(aEvent);
                break;
        }
    }

    onChange(aEvent: Event): void {
        const target = <Element>aEvent.target;
        if (target.localName !== 'input') {
            return;
        }

        const name = target.getAttribute('name');
        const value = (<HTMLInputElement>target).checked;

        SettingActionCreator.setOption(name, value);

        if (value && target.getAttribute('id') === 'badge') {
            NotificationActionCreator.requestPermission();
        }
    }

    onClick(aEvent: Event): void {
        NotificationActionCreator.playSound();
    }

    updateState(option: { name: string, value: any}): void {
        const input = <HTMLInputElement>this._element.querySelector('input[name=' + option.name + ']');
        if (!input) {
            return;
        }

        input.checked = option.value;
    }
}
