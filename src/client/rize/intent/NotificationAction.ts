// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as Rx from 'rxjs';

import {Action} from './lib';
import {NotifedTopic, NotificationIntent} from '../adapter/NotificationService';

export class NotificationAction implements Action<NotificationDispatcher> {

    private _dispatcher: NotificationDispatcher;

    constructor() {
        this._dispatcher = new NotificationDispatcher();
    }

    dispatcher(): NotificationDispatcher {
        return this._dispatcher;
    }

    showNotification(topic: NotifedTopic): void {
        this._dispatcher.showNotification.next(topic);
    }
}

export class NotificationDispatcher implements NotificationIntent {

    showNotification: Rx.Subject<NotifedTopic>;

    constructor() {
        this.showNotification = new Rx.Subject<NotifedTopic>();
    }
}
