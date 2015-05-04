/*global jQuery:true, moment:true */
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

const EVENT_NAME = 'auth';

export default class SignInViewController {

    /**
     *  @constructor
     *  @param  {Element}   element
     *  @param  {CookieDriver}  cookie
     *  @param  {SocketIoDriver}    socket
     */
    constructor(element, cookie, socket) {
        if (!element || !cookie || !socket) {
            throw new Error();
        }

        /** @type   {Element}   */
        this._element = element;

        /** @type   {CookieDriver}  */
        this._cookie = cookie;

        /** @type   {SocketIoDriver}    */
        this._socket = socket;

        element.addEventListener('show', this);
        element.addEventListener('submit', this);
    }

    /**
     *  @param  {Event} aEvent
     *  @return {void}
     */
    handleEvent(aEvent) {
        switch (aEvent.type) {
            case 'show':
                this.onShow(aEvent);
                break;
            case 'submit':
                this.onSubmit(aEvent);
                break;
        }
    }

    /**
     *  @param  {Event} aEvent
     *  @return {void}
     */
    onShow(aEvent) {
        const target = aEvent.currentTarget;
        const list = target.querySelectorAll('input');
        const array = Array.prototype.slice.call(list);
        for (let input of array) {
            // If we find the element which has no value,
            // we stop iteration & focus it.
            if (input.value === '') {
                input.focus();
                break;
            }
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

        if (!!values.user) {
            this._cookie.set('user', values.user, {
                expires: moment().add(30, 'days').toDate(),
            });
        }

        this._socket.emit(EVENT_NAME, values);
    }
}
