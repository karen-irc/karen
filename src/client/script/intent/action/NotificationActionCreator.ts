// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {NotificationDispatcher} from '../dispatcher/NotificationDispatcher';

import {ChannelId} from '../../domain/ChannelDomain';

export class NotificationActionCreator {

    private _dispatcher: NotificationDispatcher;

    constructor() {
        this._dispatcher = new NotificationDispatcher();
    }

    dispatcher(): NotificationDispatcher {
        return this._dispatcher;
    }

    playSound(): void {
        this._dispatcher.playSound.next(undefined);
    }

    requestPermission(): void {
        this._dispatcher.requestPermission.next(undefined);
    }

    showNotification(channelId: ChannelId, message: { from: string, text: string}): void {
        this._dispatcher.showNotification.next({
            channelId: channelId,
            from: message.from,
            text: message.text,
        });
    }
}
