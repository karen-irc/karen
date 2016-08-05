// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
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
