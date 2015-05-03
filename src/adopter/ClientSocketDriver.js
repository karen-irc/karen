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

import Rx from 'rx';

export default class ClientSocketDriver {

    /**
     *  @constructor
     *  @param  {SocketIO.Socket}   socket
     */
    constructor (socket) {
        /** @type   {SocketIO.Socket}   */
        this._socket = socket;
    }

    /**
     *  @return {SocketIO.Socket}
     */
    getSocket() {
        return this._socket;
    }

    /**
     *  @return {void}
     */
    emitAuth() {
        this._socket.emit('auth');
    }

    /**
     *  @return {Rx.Observable<?>}
     */
    auth() {
        return Rx.Observable.create((observer) => {
            this._socket.on('auth', (data) => {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @return {Rx.Observable<?>}
     */
    input() {
        return Rx.Observable.create((observer) => {
            this._socket.on('input', (data) => {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @return {Rx.Observable<?>}
     */
    more() {
        return Rx.Observable.create((observer) => {
            this._socket.on('more', (data) => {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @return {Rx.Observable<?>}
     */
    connect() {
        return Rx.Observable.create((observer) => {
            this._socket.on('conn', (data) => {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @return {Rx.Observable<?>}
     */
    open() {
        return Rx.Observable.create((observer) => {
            this._socket.on('open', (data) => {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @return {Rx.Observable<?>}
     */
    sort() {
        return Rx.Observable.create((observer) => {
            this._socket.on('sort', (data) => {
                observer.onNext(data);
            });
        });
    }

    /**
     *  @param  {string}  id
     *  @return {Socket}
     */
    joinClient(id) {
        return this._socket.join(id);
    }

    /**
     *  @param  {number}    active
     *  @param  {Array<Network>}    networks
     *  @param  {string}    token
     *  @return {void}
     */
    emitInitialize(active, networks, token) {
        this._socket.emit('init', {
            active,
            networks,
            token,
        });
    }
}
