/**
 * @license MIT License
 *
 * Copyright (c) 2016 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2016 Yusuke Suzuki <utatane.tea@gmail.com>
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

import {BehaviorSubject, Observable, Observer} from 'rxjs';

export class ReactiveProperty<T> implements Observer<T> {

    private _subject: BehaviorSubject<T>;

    constructor(initial: T) {
        this._subject = new BehaviorSubject<T>(initial);
    }

    unsubscribe(): void {
        return this._subject.unsubscribe();
    }

    get isUnsubscribed(): boolean {
        return this._subject.isUnsubscribed;
    }

    next(value: T): void {
        this._subject.next(value);
    }

    // XXX: `Rx.Subject.error()` requires `any` as its arguments
    error(err: any): void { // tslint:disable-line:no-any
        this._subject.error(err);
    }

    complete(): void {
        this._subject.complete();
    }

    asObservable(): Observable<T> {
        return this._subject;
    }

    value(): T {
        return this._subject.getValue();
    }

    setValue(value: T): void {
        return this.next(value);
    }
}
