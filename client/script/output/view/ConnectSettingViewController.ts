/*global jQuery:true */
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

/// <reference path="../../../../tsd/core-js.d.ts" />
/// <reference path="../../../../tsd/third_party/jquery/jquery.d.ts" />

// babel's `es6.forOf` transform uses `Symbol` and 'Array[Symbol.iterator]'.
import 'core-js/modules/es6.array.iterator';
import 'core-js/es6/symbol';

import arrayFrom from 'core-js/library/fn/array/from';
import SocketIoDriver from '../../adapter/SocketIoDriver';

const EVENT_NAME = 'conn';

export default class ConnectSettingViewController implements EventListenerObject {

    _element: Element;
    _socket: SocketIoDriver;

    constructor(element: Element, socket: SocketIoDriver) {
        if (!element || !socket) {
            throw new Error();
        }

        this._element = element;

        this._socket = socket;

        element.addEventListener('submit', this);
        element.addEventListener('input', this);
    }

    handleEvent(aEvent: Event): void {
        switch (aEvent.type) {
            case 'submit':
                this.onSubmit(aEvent);
                break;
            case 'input':
                this.onInput(aEvent);
                break;
        }
    }


    onSubmit(aEvent: Event): void {
        const target = <Element>aEvent.target;
        if (target.localName !== 'form') {
            return;
        }
        aEvent.preventDefault();

        // XXX: By DOM spec (https://dom.spec.whatwg.org/#interface-nodelist),
        // NodeList should be iterable<Node> and this means it has `Symbol.iterator`
        // by Web IDL spec (http://heycam.github.io/webidl/#idl-iterable).
        const list: any = target.querySelectorAll('.btn');
        for (let element of arrayFrom(list)) {
            (<Element>element).setAttribute('disabled', 'true');
        }

        const values = {};
        jQuery(target).serializeArray().forEach(function(obj) {
            if (obj.value !== '') {
                values[obj.name] = obj.value;
            }
        });

        this._socket.emit(EVENT_NAME, values);
    }

    onInput(aEvent: Event): void {
        const target = <HTMLInputElement>aEvent.target;
        if (!target.classList.contains('nick')) {
            return;
        }

        const nickname = target.value;

        // XXX: By DOM spec (https://dom.spec.whatwg.org/#interface-nodelist),
        // NodeList should be iterable<Node> and this means it has `Symbol.iterator`
        // by Web IDL spec (http://heycam.github.io/webidl/#idl-iterable).
        const list: any = this._element.querySelectorAll('.username');
        for (let input of arrayFrom<Node>(list)) {
            (<HTMLInputElement>input).value = nickname;
        }
    }
}
