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

export class ClientSocketDriver {

    /**
     *  @constructor
     *  @param  {SocketIO.Socket}   socket
     */
    constructor(socket) {
        /** @type   {SocketIO.Socket}   */
        this._socket = socket;
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
        return Rx.Observable.fromEvent(this._socket, 'auth');
    }

    /**
     *  @return {Rx.Observable<?>}
     */
    input() {
        return Rx.Observable.fromEvent(this._socket, 'input');
    }

    /**
     *  @return {Rx.Observable<?>}
     */
    more() {
        return Rx.Observable.fromEvent(this._socket, 'more');
    }

    /**
     *  @return {Rx.Observable<?>}
     */
    connect() {
        return Rx.Observable.fromEvent(this._socket, 'conn');
    }

    /**
     *  @return {Rx.Observable<?>}
     */
    open() {
        return Rx.Observable.fromEvent(this._socket, 'open');
    }

    /**
     *  @return {Rx.Observable<?>}
     */
    sort() {
        return Rx.Observable.fromEvent(this._socket, 'sort');
    }

    /**
     *  @return {Rx.Observable<void>}
     */
    disconnect() {
        return Rx.Observable.fromEvent(this._socket, 'disconnect');
    }

    /**
     *  @param  {string}  id
     *  @return {Socket}
     */
    joinClient(id) {
        return this._socket.join(id);
    }

    /**
     *  @param  {Option<number|string>}    active
     *  @param  {Array<Network>}    networks
     *  @param  {string}    token
     *  @param  {Array<?>}  connections
     *  @return {void}
     */
    emitInitialize(active, networks, token, connections) {
        this._socket.emit('init', {
            active,
            networks,
            token,
            connections,
        });
    }
}
