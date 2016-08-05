// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as Rx from 'rxjs';

export class AppActionDispatcher {
    reload: Rx.Subject<void>;
    signout: Rx.Subject<void>;

    constructor() {
        this.reload = new Rx.Subject<void>();

        this.signout = new Rx.Subject<void>();
    }
}
