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

import io from 'socket.io-client';
import Rx from 'rx';

export default class SocketIoDriver {

    /**
     *  @constructor
     */
    constructor() {
        /** @type   {SocketIOClient.Socket} */
        this._socket = io();
    }

    /**
     *  @return {SocketIOClient.Socket}
     */
    getSocket() {
        return this._socket;
    }

    /**
     *  @return {!Rx.Observable<?>}
     */
    error() {
        return Rx.Observable.create((observer) => {
            this._socket.on('error', function (e) {
                observer.onError(e);
            });
        });
    }

    /**
     *  @return {!Rx.Observable<void>}
     */
    connectError() {
        return Rx.Observable.create((observer) => {
            this._socket.on('connect_error', function () {
                observer.onNext();
            });
        });
    }

    /**
     *  @return {!Rx.Observable<void>}
     */
    disconnect() {
        return Rx.Observable.create((observer) => {
            this._socket.on('disconnect', function () {
                observer.onNext();
            });
        });
    }

    /**
     *  @return {!Rx.Observable<?>}
     */
    auth() {
        return Rx.Observable.create((observer) => {
            this._socket.on('auth', function (data) {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @return {!Rx.Observable<?>}
     */
    init() {
        return Rx.Observable.create((observer) => {
            this._socket.on('init', function (data) {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @return {!Rx.Observable<?>}
     */
    join() {
        return Rx.Observable.create((observer) => {
            this._socket.on('join', function (data) {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @return {!Rx.Observable<?>}
     */
    message() {
        return Rx.Observable.create((observer) => {
            this._socket.on('msg', function (data) {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @return {!Rx.Observable<?>}
     */
    more() {
        return Rx.Observable.create((observer) => {
            this._socket.on('more', function (data) {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @return {!Rx.Observable<?>}
     */
    network() {
        return Rx.Observable.create((observer) => {
            this._socket.on('network', function (data) {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @return {!Rx.Observable<?>}
     */
    nickname() {
        return Rx.Observable.create((observer) => {
            this._socket.on('nick', function (data) {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @return {!Rx.Observable<?>}
     */
    part() {
        return Rx.Observable.create((observer) => {
            this._socket.on('part', function (data) {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @return {!Rx.Observable<?>}
     */
    quit() {
        return Rx.Observable.create((observer) => {
            this._socket.on('quit', function (data) {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @return {!Rx.Observable<?>}
     */
    toggle() {
        return Rx.Observable.create((observer) => {
            this._socket.on('toggle', function (data) {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @return {!Rx.Observable<?>}
     */
    topic() {
        return Rx.Observable.create((observer) => {
            this._socket.on('topic', function (data) {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @return {!Rx.Observable<?>}
     */
    users() {
        return Rx.Observable.create((observer) => {
            this._socket.on('users', function (data) {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @param  {string}  name
     *  @param  {?} obj
     *  @return {void}
     */
    emit(name, obj) {
        this._socket.emit(name, obj);
    }
}
