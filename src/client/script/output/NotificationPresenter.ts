// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as Rx from 'rxjs';

import {AudioDriver} from '../adapter/AudioDriver';
import {ConfigRepository} from '../settings/repository/ConfigRepository';
import {ChannelId} from '../domain/ChannelDomain';
import {NotificationActionCreator} from '../intent/action/NotificationActionCreator';
import {UIActionCreator} from '../intent/action/UIActionCreator';

declare const Notification: any; // tslint:disable-line:no-any

const ICON_URL = '/img/logo-64.png';

export class NotificationPresenter {

    _notifyAction: NotificationActionCreator;
    _uiAction: UIActionCreator;
    _audio: AudioDriver;
    _config: ConfigRepository;
    _disposePlay: Rx.Subscription;
    _disposeRequestPermission: Rx.Subscription;
    _disposeshowNotification: Rx.Subscription;

    constructor(config: ConfigRepository, notifyAction: NotificationActionCreator, uiAction: UIActionCreator) {
        const dispatcher = notifyAction.dispatcher();

        this._notifyAction = notifyAction;
        this._uiAction = uiAction;

        this._audio = new AudioDriver('/audio/pop.ogg');

        this._config = config;

        this._disposePlay = dispatcher.playSound.subscribe(() => {
            this.playSound();
        });

        this._disposeRequestPermission = dispatcher.requestPermission.subscribe(() => {
            this.requestPermission();
        });

        this._disposeshowNotification = dispatcher.showNotification.subscribe((data) => {
            this.showNotification(data.channelId, data.from, data.text);
        });
    }

    destroy(): void {
        this._disposePlay.unsubscribe();
        this._disposeRequestPermission.unsubscribe();
        this._disposeshowNotification.unsubscribe();

        this._audio.destroy();
    }

    playSound(): void {
        this._audio.play();
    }

    requestPermission(): void {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }

    showNotification(channelId: ChannelId, from: string, text: string): void {
        const settings = this._config.get();
        if (settings.notification) {
            // FIXME: should call in `NotificationActionCreator.showNotification()`
            this._notifyAction.playSound();
        }

        if (settings.badge && Notification.permission === 'granted') {
            let notification = new Notification(from + ' says:', {
                body: text,
                icon: ICON_URL,
            });

            const timeout: Rx.Observable<void> = Rx.Observable.empty<void>().delay(5 * 1000);
            const click: Rx.Observable<void> = Rx.Observable.fromEvent<void>(notification, 'click').take(1).do(() => {
                this._uiAction.focusWindow();
                this._uiAction.selectChannel(channelId);
            });

            const close: Rx.Observable<void> = click.race(timeout);
            close.subscribe(function(){}, function(){}, function(){
                notification.close();
                notification = null;
            });
        }
    }
}
