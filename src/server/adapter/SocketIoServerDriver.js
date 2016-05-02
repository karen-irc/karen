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

import io from 'socket.io';
import * as Rx from 'rxjs';

import {ClientSocketDriver} from './ClientSocketDriver';

export class SocketIoServerDriver {

    /**
     *  @constructor
     *  @param  {http.Server}   server
     *  @param  {Array<string>} transports
     */
    constructor(server, transports) {
        /** @type   {SocketIO.Server}   */
        this._server = io(server, {
            transports,
            httpCompression: true
        });
    }

    /**
     *  @return {SocketIO.Server}
     */
    getServer() {
        return this._server;
    }

    /**
     *  @return {Rx.Observable<ClientSocketDriver>}
     */
    connect() {
        return Rx.Observable.create((observer) => {
            this._server.on('connect', (socket) => {
                const gateway = new ClientSocketDriver(socket);
                observer.next(gateway);
            });
        });
    }
}
