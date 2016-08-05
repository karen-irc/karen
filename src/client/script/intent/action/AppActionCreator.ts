// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {AppActionDispatcher} from '../dispatcher/AppActionDispatcher';

export class AppActionCreator {

    private _dispatcher: AppActionDispatcher;

    constructor() {
        this._dispatcher = new AppActionDispatcher();
    }

    dispatcher(): AppActionDispatcher {
        return this._dispatcher;
    }

    reload(): void {
        this._dispatcher.reload.next(undefined);
    }

    signout(): void {
        this._dispatcher.signout.next(undefined);
        this._dispatcher.reload.next(undefined);
    }
}
