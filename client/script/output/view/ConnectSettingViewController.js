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

const EVENT_NAME = 'conn';

export default class ConnectSettingViewController {

    /**
     *  @constructor
     *  @param  {Element}   element
     *  @param  {SocketIoDriver}    socket
     */
    constructor(element, socket) {
        if (!element || !socket) {
            throw new Error();
        }

        /** @type   {Element}   */
        this._element = element;

        /** @type {SocketIoDriver}  */
        this._socket = socket;

        element.addEventListener('submit', this);
        element.addEventListener('input', this);
    }

    /**
     *  @param  {Event} aEvent
     *  @return {void}
     */
    handleEvent(aEvent) {
        switch (aEvent.type) {
            case 'submit':
                this.onSubmit(aEvent);
                break;
            case 'input':
                this.onInput(aEvent);
                break;
        }
    }

    /**
     *  @param  {Event} aEvent
     *  @return {void}
     */
    onSubmit(aEvent) {
        const target = aEvent.target;
        if (target.localName !== 'form') {
            return;
        }
        aEvent.preventDefault();

        const list = target.querySelectorAll('.btn');
        for (let element of Array.prototype.slice.call(list)) {
            element.setAttribute('disabled', 'true');
        }

        const values = {};
        jQuery(target).serializeArray().forEach(function(obj) {
            if (obj.value !== '') {
                values[obj.name] = obj.value;
            }
        });

        this._socket.emit(EVENT_NAME, values);
    }

    /**
     *  @param  {Event} aEvent
     *  @return {void}
     */
    onInput(aEvent) {
        const target = aEvent.target;
        if (!target.classList.contains('nick')) {
            return;
        }

        const nickname = target.value;
        const list = this._element.querySelectorAll('.username');
        for (let input of Array.prototype.slice.call(list)) {
            input.value = nickname;
        }
    }
}
