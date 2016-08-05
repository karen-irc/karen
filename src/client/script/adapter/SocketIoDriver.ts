// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
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
