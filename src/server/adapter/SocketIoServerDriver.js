// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
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
