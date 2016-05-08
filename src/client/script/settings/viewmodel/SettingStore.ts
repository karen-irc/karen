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

import {ConfigRepository} from '../repository/ConfigRepository';
import {Setting} from '../domain/value/Setting';
import SettingActionCreator from '../intent/GeneralSettingIntent';

type SetValue = {
    name: string;
    value: any;
};

export class SettingStore {

    _subject: Rx.Subject<SetValue>;
    _repository: ConfigRepository;
    _setting: Setting;
    _initStream: Rx.Observable<SetValue>;
    _disposeUpdate: Rx.Subscription;

    constructor(config: ConfigRepository) {
        this._subject = new Rx.Subject<SetValue>();

        this._repository = config;

        this._setting = config.get();

        this._initStream = Rx.Observable.create((observer: Rx.Subscriber<SetValue>) => {
            const keys = Object.keys(this._setting);
            for (let key of keys) {
                observer.next({
                    name: key,
                    value: (this._setting as any)[key],
                });
            }
            observer.complete();
        });

        this._disposeUpdate = SettingActionCreator.dispatcher().setOption.subscribe((data) => {
            this.update(data.name, data.value);
        });
    }

    subscribe(observer: Rx.Subscriber<SetValue>): Rx.Subscription {
        return Rx.Observable.merge(
            this._subject,
            this._initStream
        ).subscribe(observer);
    }

    update(name: string, value: any): void {
        const setting = this._setting;
        (setting as any)[name] = value;
        this._repository.set(setting);

        this._subject.next({
            name: name,
            value: value,
        });
    }
}
