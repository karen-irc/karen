// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as Rx from 'rxjs';

interface Notification extends EventTarget {
    close(): void;
}

export interface NotifedTopic {
    title: string;
    body: string;
    icon: string;
}

export interface NotificationIntent {
    showNotification: Rx.Observable<NotifedTopic>;
}

export class NotificationService {

    private _show: Rx.Observable<void>;

    constructor(intent: NotificationIntent) {
        const showIntent = intent.showNotification.share();
        const [granted, needReq] = showIntent.partition(isNotificationGranted);
        const tried = needReq.flatMap<boolean>(requestPermittion)
            .filter(function(ok: boolean) {
                return ok;
            })
            .withLatestFrom(showIntent, function (_: boolean, topic: NotifedTopic) {
                return topic;
            }).share();
        const merged: Rx.Observable<NotifedTopic> = granted.merge(tried);
        const notification = merged.flatMap<void>(function(topic: NotifedTopic) {
            return showNotification(topic);
        });
        this._show = notification.share();
    }

    show(): Rx.Observable<void> {
        return this._show;
    }
}

function isNotificationGranted(): boolean {
    return (window as any).Notification.permission === 'granted'; // tslint:disable-line:no-any
}

function requestPermittion(): Rx.Observable<boolean> {
    return Rx.Observable.create(function (o: Rx.Observer<boolean>) {
        (window as any).Notification.requestPermission(function (permission: string) { // tslint:disable-line:no-any
            const isGranted = permission === 'granted';
            o.next(isGranted);
            o.complete();
        });
    });
}

function showNotification(topic: NotifedTopic): Rx.Observable<void> {
    let notification: Notification | void = new (window as any).Notification(topic.title, { // tslint:disable-line:no-any
        body: topic.body,
        icon: topic.icon,
    });
    const timeout = Rx.Observable.empty<void>().delay(5 * 1000);
    const click = Rx.Observable.fromEvent<void>(notification!, 'click').take(1);
    const close: Rx.Observable<void> = click.race(timeout).do(function(){
        notification.close();
        notification = undefined;
    });
    return close.share();
}
