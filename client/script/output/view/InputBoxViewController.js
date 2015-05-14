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

import MessageActionCreator from '../../action/MessageActionCreator';
import Mousetrap from 'mousetrap';
import Rx from 'rx';
import UIActionCreator from '../../action/UIActionCreator';

export default class InputBoxViewController {

    /**
     *  @constructor
     *  @param  {Element}   element
     */
    constructor(element) {
        if (!element) {
            throw new Error();
        }

        /** @type   {Element}   */
        this._element = element;

        /** @type   {Element}   */
        this._textInput = element.querySelector('#input');

        /*eslint-disable valid-jsdoc */
        /** @type   {Rx.IDisposable}    */
        this._disposeFocus = UIActionCreator.getDispatcher().focusInputBox.subscribe(() => {
            this.focusInput();
        });
        /*eslint-enable*/

        /** @type   {Rx.Subject<Rx.AsyncSubject<string>>}   */
        this.queryCurrentChannel = new Rx.Subject();

        this._init();
    }

    _init() {
        this._element.addEventListener('submit', this);

        const shortcut = [
            'command+k',
            'ctrl+l',
            'ctrl+shift+l'
        ];
        Mousetrap(this._textInput).bind(shortcut, (aEvent) => {
            MessageActionCreator.clear();
        });
    }

    /**
     *  @return {Element}
     */
    get textInput() {
        return this._textInput;
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
        }
    }

    /**
     *  @param  {Event} aEvent
     *  @return {void}
     */
    onSubmit(aEvent) {
        aEvent.preventDefault();

        const input = this._textInput;
        const text = input.value;
        // lock input field until dispatching to input command.
        input.readOnly = true;

        // FIXME: this is pretty ad hoc way.
        // should create a reasonable domain model approach.
        let query = new Rx.AsyncSubject();
        query.subscribe((id) => {
            MessageActionCreator.inputCommand(id, text);
            input.value = '';
            input.readOnly = false;
        });

        this.queryCurrentChannel.onNext(query);
    }

    /**
     *  @return {void}
     */
    focusInput() {
        this._textInput.focus();
    }
}
