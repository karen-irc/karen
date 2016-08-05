// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as Rx from 'rxjs';

import {ConnectionValue} from '../domain/value/ConnectionSettings';

export class ConnectionActionCreator {

    private _dispatcher: ConnectionActionDispatcher;

    constructor() {
        this._dispatcher = new ConnectionActionDispatcher();
    }

    dispose(): void {
        this._dispatcher = undefined as any; // tslint:disable-line:no-any
    }

    dispatcher(): ConnectionActionDispatcher {
        return this._dispatcher;
    }

    tryConnect(param: ConnectionValue): void {
        this._dispatcher.tryConnect.next(param);
    }
}

export class ConnectionActionDispatcher {
    tryConnect: Rx.Subject<ConnectionValue>;

    constructor() {
        this.tryConnect = new Rx.Subject<ConnectionValue>();

        Object.seal(this);
    }
}
