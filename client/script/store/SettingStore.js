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

// babel's `es6.forOf` transform uses `Symbol` and 'Array[Symbol.iterator]'.
import 'core-js/modules/es6.array.iterator';
import 'core-js/es6/symbol';

import Rx from 'rx';
import SettingActionCreator from '../intent/action/SettingActionCreator';

export default class SettingStore {
    /**
     *  @constructor
     *  @param  {ConfigRepository}  config
     */
    constructor(config) {
        /** @type   {Rx.Subject<{ name: string, value: *}>} */
        this._subject = new Rx.Subject();

        /** @type   {ConfigRepository}  */
        this._repository = config;

        /** @type   {Setting}   */
        this._setting = config.get();

        /*eslint-disable valid-jsdoc */
        /** @type   {Rx.Observable<{ name: string, value: *}>}  */
        this._initStream = Rx.Observable.create((observer) => {
            const keys = Object.keys(this._setting);
            for (let key of keys) {
                observer.onNext({
                    name: key,
                    value: this._setting[key],
                });
            }
            observer.onCompleted();
        });

        /** @type   {Rx.Subject<{ name: string, value: *}>} */
        this._disposeUpdate = SettingActionCreator.getDispatcher().setOption.subscribe((data) => {
            this.update(data.name, data.value);
        });
        /*eslint-enable*/
    }

    /**
     *  @param  {Rx.IObserver}  observer
     *  @return {Rx.IDisposable}
     */
    subscribe(observer) {
        return Rx.Observable.merge(
            this._subject,
            this._initStream
        ).subscribe(observer);
    }

    /**
     *  @param  {string}  name
     *  @param  {*} value
     *  @return {void}
     */
    update(name, value) {
        const setting = this._setting;
        setting[name] = value;
        this._repository.set(setting);

        this._subject.onNext({
            name: name,
            value: value,
        });
    }
}
