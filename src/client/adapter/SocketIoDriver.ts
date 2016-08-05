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

import * as io from 'socket.io-client';
import * as Rx from 'rxjs';

export class SocketIoDriver {

    private _socket: SocketIOClient.Socket;

    constructor() {
        this._socket = io.connect();
    }

    error(): Rx.Observable<any> { //tslint:disable-line:no-any
        return Rx.Observable.fromEvent(this._socket, 'error');
    }

    connectError(): Rx.Observable<void> {
        return Rx.Observable.fromEvent<void>(this._socket, 'connect_error');
    }

    disconnect(): Rx.Observable<void> {
        return Rx.Observable.fromEvent<void>(this._socket, 'disconnect');
    }

    auth(): Rx.Observable<any> { // tslint:disable-line:no-any
        return Rx.Observable.fromEvent(this._socket, 'auth');
    }

    init(): Rx.Observable<any> { // tslint:disable-line:no-any
        return Rx.Observable.fromEvent(this._socket, 'init');
    }

    join(): Rx.Observable<any> { // tslint:disable-line:no-any
        return Rx.Observable.fromEvent(this._socket, 'join');
    }

    message(): Rx.Observable<any> { // tslint:disable-line:no-any
        return Rx.Observable.fromEvent(this._socket, 'msg');
    }

    more(): Rx.Observable<any> { // tslint:disable-line:no-any
        return Rx.Observable.fromEvent(this._socket, 'more');
    }

    network(): Rx.Observable<any> { // tslint:disable-line:no-any
        return Rx.Observable.fromEvent(this._socket, 'network');
    }

    nickname(): Rx.Observable<any> { // tslint:disable-line:no-any
        return Rx.Observable.fromEvent(this._socket, 'nick');
    }

    part(): Rx.Observable<any> { // tslint:disable-line:no-any
        return Rx.Observable.fromEvent(this._socket, 'part');
    }

    quit(): Rx.Observable<any> { // tslint:disable-line:no-any
        return Rx.Observable.fromEvent(this._socket, 'quit');
    }

    toggle(): Rx.Observable<any> { // tslint:disable-line:no-any
        return Rx.Observable.fromEvent(this._socket, 'toggle');
    }

    topic(): Rx.Observable<any> { // tslint:disable-line:no-any
        return Rx.Observable.fromEvent(this._socket, 'topic');
    }

    users(): Rx.Observable<any> { // tslint:disable-line:no-any
        return Rx.Observable.fromEvent(this._socket, 'users');
    }

    emit(name: string, obj: any): void { // tslint:disable-line:no-any
        this._socket.emit(name, obj);
    }
}
