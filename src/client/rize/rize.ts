// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {NotificationService} from './adapter/NotificationService';
import {NotificationAction} from './intent/NotificationAction';

import {ApplicationContext} from './context/ApplicationContext';

/**
 *  ReInitialiZEd Client
 */
export class RizeClient {

    private _notification: NotificationService;

    constructor() {
        const notifyAction = new NotificationAction();
        this._notification = new NotificationService(notifyAction.dispatcher());

        const appCtx = new ApplicationContext();
        appCtx.onActivate(document.getElementById('js-mountpoint-app')!);
    }
}
