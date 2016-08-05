/*global moment: true */
// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as Rx from 'rxjs';


import {CookieDriver} from '../../adapter/CookieDriver';
import {Setting} from '../domain/value/Setting';

declare const moment: any; // tslint:disable-line:no-any

const KEY_SETTING = 'settings';

export class ConfigRepository {

    private _cookie: CookieDriver;
    private _subject: Rx.Subject<Setting>;

    constructor(cookie: CookieDriver) {
        this._cookie = cookie;
        this._subject = new Rx.Subject<Setting>();
    }

    get(): Setting {
        const raw = this._cookie.get(KEY_SETTING);
        const settings = new Setting(raw);
        return settings;
    }

    set(settings: Setting): void {
        this._cookie.set(KEY_SETTING, settings, {
            expires: moment().add(365, 'days').toDate(),
        });
        this._subject.next(settings);
    }

    asObservable(): Rx.Observable<Setting> {
        return this._subject;
    }
}
