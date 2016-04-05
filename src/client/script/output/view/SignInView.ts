/*global moment:true */
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

import {CookieDriver} from '../../adapter/CookieDriver';
import {SocketIoDriver} from '../../adapter/SocketIoDriver';

declare const moment: any;

const EVENT_NAME = 'auth';

export class SignInView implements EventListenerObject {

    _element: Element;
    _cookie: CookieDriver;
    _socket: SocketIoDriver;

    constructor(element: Element, cookie: CookieDriver, socket: SocketIoDriver) {
        this._element = element;
        this._cookie = cookie;
        this._socket = socket;

        element.addEventListener('show', this);
        element.addEventListener('submit', this);
    }

    handleEvent(aEvent: Event): void {
        switch (aEvent.type) {
            case 'show':
                this.onShow(aEvent);
                break;
            case 'submit':
                this.onSubmit(aEvent);
                break;
        }
    }

    onShow(aEvent: Event): void {
        const target = aEvent.currentTarget as Element;
        // XXX: By DOM spec (https://dom.spec.whatwg.org/#interface-nodelist),
        // NodeList should be iterable<Node> and this means it has `Symbol.iterator`
        // by Web IDL spec (http://heycam.github.io/webidl/#idl-iterable).
        const list = target.querySelectorAll('input');
        for (let element of Array.from(list)) {
            const input = element as HTMLInputElement;
            // If we find the element which has no value,
            // we stop iteration & focus it.
            if (input.value === '') {
                input.focus();
                break;
            }
        }
    }

    onSubmit(aEvent: Event): void {
        const target = aEvent.target as Element;
        if (target.localName !== 'form') {
            return;
        }
        aEvent.preventDefault();

        // XXX: By DOM spec (https://dom.spec.whatwg.org/#interface-nodelist),
        // NodeList should be iterable<Node> and this means it has `Symbol.iterator`
        // by Web IDL spec (http://heycam.github.io/webidl/#idl-iterable).
        const list = target.querySelectorAll('.btn');
        for (let element of Array.from(list)) {
            (element as Element).setAttribute('disabled', 'true');
        }

        const values: { user: string, [key: string]: any, } = {
            user: '',
        };
        Array.from(target.querySelectorAll('input')).forEach(function(element: HTMLInputElement){
            if (element.value !== '') {
                values[element.name] = element.value;
            }
        });

        if (!!values.user) {
            this._cookie.set('user', values.user, {
                expires: moment().add(30, 'days').toDate(),
            });
        }

        this._socket.emit(EVENT_NAME, values);
    }
}
