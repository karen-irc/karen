/**
 * @license MIT License
 *
 * Copyright (c) 2015 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
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

import {Observable} from 'rxjs';

import {NotificationActionCreator} from '../../intent/action/NotificationActionCreator';
import {ReactiveProperty} from '../../../../lib/ReactiveProperty';

import {
    Setting,
    MessageSetting,
    LinkContentSetting,
    NotificationSetting
} from '../domain/value/Setting';

export class MessageSettingViewModel {

    private _showJoin: ReactiveProperty<boolean>;
    private _showPart: ReactiveProperty<boolean>;
    private _showMode: ReactiveProperty<boolean>;
    private _showMotd: ReactiveProperty<boolean>;
    private _showNickChange: ReactiveProperty<boolean>;
    private _showQuit: ReactiveProperty<boolean>;

    constructor(initial: Setting) {
        this._showJoin = new ReactiveProperty(initial.join);
        this._showPart = new ReactiveProperty(initial.part);
        this._showMode = new ReactiveProperty(initial.mode);
        this._showMotd = new ReactiveProperty(initial.motd);
        this._showNickChange = new ReactiveProperty(initial.nick);
        this._showQuit = new ReactiveProperty(initial.quit);
    }

    showJoin(): ReactiveProperty<boolean> {
        return this._showJoin;
    }

    showPart(): ReactiveProperty<boolean> {
        return this._showPart;
    }

    showMode(): ReactiveProperty<boolean> {
        return this._showMode;
    }

    showMotd(): ReactiveProperty<boolean> {
        return this._showMotd;
    }

    showNickChange(): ReactiveProperty<boolean> {
        return this._showNickChange;
    }

    showQuit(): ReactiveProperty<boolean> {
        return this._showQuit;
    }

    asObservable(): Observable<MessageSetting> {
        return Observable.combineLatest(
            this._showJoin.asObservable(),
            this._showPart.asObservable(),
            this._showMode.asObservable(),
            this._showMotd.asObservable(),
            this._showNickChange.asObservable(),
            this._showQuit.asObservable(),
            (showJoin, showPart, showMode, showMotd, showNickChange, showQuit) => {
                return {
                    showJoin,
                    showPart,
                    showMode,
                    showMotd,
                    showNickChange,
                    showQuit,
                };
            }
        );
    }
}

export class LinkContentViewModel {
    private _autoExpandThumbnail: ReactiveProperty<boolean>;
    private _autoExpandLinks: ReactiveProperty<boolean>;

    constructor(initial: Setting) {
        this._autoExpandThumbnail = new ReactiveProperty(initial.thumbnails);
        this._autoExpandLinks = new ReactiveProperty(initial.links);
    }

    autoExpandThumbnail(): ReactiveProperty<boolean> {
        return this._autoExpandThumbnail;
    }

    autoExpandLinks(): ReactiveProperty<boolean> {
        return this._autoExpandLinks;
    }

    asObservable(): Observable<LinkContentSetting> {
        return Observable.combineLatest(
            this._autoExpandThumbnail.asObservable(),
            this._autoExpandLinks.asObservable(),
            (autoExpandThumbnail, autoExpandLinks) => {
                return {
                    autoExpandThumbnail,
                    autoExpandLinks,
                };
            }
        );
    }
}

export class NotificationViewModel {
    private _badge: ReactiveProperty<boolean>;
    private _notification: ReactiveProperty<boolean>;

    constructor(initial: Setting) {
        this._badge = new ReactiveProperty(initial.badge);
        this._notification = new ReactiveProperty(initial.notification);
    }

    showBadge(): ReactiveProperty<boolean> {
        return this._badge;
    }

    showNotification(): ReactiveProperty<boolean> {
        return this._notification;
    }

    asObservable(): Observable<NotificationSetting> {
        return Observable.combineLatest(
            this._badge.asObservable(),
            this._notification.asObservable(),
            (badge, notification) => {
                return {
                    badge,
                    notification,
                };
            }
        );
    }
}

export class GeneralSettingViewModel {
    private _notifyAction: NotificationActionCreator;
    private _message: MessageSettingViewModel;
    private _link: LinkContentViewModel;
    private _notification: NotificationViewModel;

    constructor(initial: Setting, notifyAction: NotificationActionCreator) {
        this._notifyAction = notifyAction;
        this._message = new MessageSettingViewModel(initial);
        this._link = new LinkContentViewModel(initial);
        this._notification = new NotificationViewModel(initial);
    }

    message(): MessageSettingViewModel {
        return this._message;
    }

    link(): LinkContentViewModel {
        return this._link;
    }

    notification(): NotificationViewModel {
        return this._notification;
    }

    asObservable(): Observable<Setting> {
        const message = this._message.asObservable();
        const link = this._link.asObservable();
        const notification = this._notification.asObservable();

        const result: Observable<Setting> = Observable.combineLatest(
            message,
            link,
            notification,
            (message, link, notification) => {
                return {
                    join: message.showJoin,
                    mode: message.showMode,
                    motd: message.showMotd,
                    nick: message.showNickChange,
                    part: message.showPart,
                    quit: message.showQuit,

                    links: link.autoExpandLinks,
                    thumbnails: link.autoExpandThumbnail,

                    badge: notification.badge,
                    notification: notification.notification,
                };
            });
        return result;
    }

    playSound(): void {
        this._notifyAction.playSound();
    }
}
