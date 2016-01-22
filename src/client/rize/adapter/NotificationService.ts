/**
 * MIT License
 *
 * Copyright (c) 2016 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2016 Yusuke Suzuki <utatane.tea@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import * as Rx from 'rxjs';

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
    return (<any>window).Notification.permission === 'granted';
}

function requestPermittion(): Rx.Observable<boolean> {
    return Rx.Observable.create(function (o: Rx.Observer<boolean>) {
        (<any>window).Notification.requestPermission(function (permission: string) {
            const isGranted = permission === 'granted';
            o.next(isGranted);
            o.complete();
        });
    });
}

function showNotification(topic: NotifedTopic): Rx.Observable<void> {
    let notification = new (<any>window).Notification(topic.title, {
        body: topic.body,
        icon: topic.icon,
    });
    const timeout = Rx.Observable.empty().delay(5 * 1000);
    const click = Rx.Observable.fromEvent(<EventTarget>notification, 'click').take(1);
    const close: Rx.Observable<void> = click.race(timeout).do(function(){
        notification.close();
        notification = null;
    });
    return close.share();
}