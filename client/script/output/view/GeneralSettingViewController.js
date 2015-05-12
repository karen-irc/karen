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

import NotificationActionCreator from '../../action/NotificationActionCreator';
import SettingActionCreator from '../../action/SettingActionCreator';

export default class GeneralSettingViewController {

    /**
     *  @constructor
     *  @param  {Element}   element
     *  @param  {SettingStore}  store
     */
    constructor(element, store) {
        if (!element || !store) {
            throw new Error();
        }

        /** @type   {Element}   */
        this._element = element;

        /** @type   {Element}   */
        this._playElement = element.querySelector('#play');

        /*eslint-disable valid-jsdoc */
        /** @type   {Rx.IDisposable}  */
        this._disposeStore = store.subscribe((option) => {
            this.updateState(option);
        });
        /*eslint-enable */

        element.addEventListener('change', this);
        this._playElement.addEventListener('click', this);
    }

    /**
     *  @param  {Event} aEvent
     *  @return {void}
     */
    handleEvent(aEvent) {
        switch (aEvent.type) {
            case 'change':
                this.onChange(aEvent);
                break;
            case 'click':
                this.onClick(aEvent);
                break;
        }
    }

    /**
     *  @param  {Event} aEvent
     *  @return {void}
     */
    onChange(aEvent) {
        const target = aEvent.target;
        if (target.localName !== 'input') {
            return;
        }

        const name = target.getAttribute('name');
        const value = target.checked;

        SettingActionCreator.setOption(name, value);
    }

    /**
     *  @param  {Event} aEvent
     *  @return {void}
     */
    onClick(aEvent) {
        NotificationActionCreator.playSound();
    }

    /**
     *  @param  {{ name: string, value: *}} option
     *  @return {void}
     */
    updateState(option) {
        const input = this._element.querySelector('input[name=' + option.name + ']');
        if (!input) {
            return;
        }

        input.checked = option.value;
    }
}
