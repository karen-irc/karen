// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as Rx from 'rxjs';

import {ChannelId} from '../../domain/ChannelDomain';

type NotificationValue = {
    channelId: ChannelId,
    from: string,
    text: string,
};

export class NotificationDispatcher {

    playSound: Rx.Subject<void>;
    requestPermission: Rx.Subject<void>;
    showNotification: Rx.Subject<NotificationValue>;

    constructor() {
        this.playSound = new Rx.Subject<void>();
        this.requestPermission = new Rx.Subject<void>();
        this.showNotification = new Rx.Subject<NotificationValue>();
    }
}
