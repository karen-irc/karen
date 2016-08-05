/*global moment: true */
// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {Option} from 'option-t';
import {Subject, Subscription} from 'rxjs';

import {CookieDriver} from './CookieDriver';

declare const moment: any; // tslint:disable-line:no-any

const KEY_TOKEN = 'token';
const KEY_USER = 'user';

export class AuthRepository {

    private _cookie: CookieDriver;
    private _disposer: Subscription;

    constructor(cookie: CookieDriver, signoutAction: Subject<void>) {
        this._cookie = cookie;

        const disposer = new Subscription();
        this._disposer = disposer;

        disposer.add(signoutAction.subscribe(() => {
            this.removeToken();
        }));
    }

    getUser(): Option<string> {
        return this._cookie.get(KEY_USER);
    }

    getToken(): Option<string> {
        return this._cookie.get(KEY_TOKEN);
    }

    setToken(token: string): void {
        this._cookie.set(KEY_TOKEN, token, {
            expires: moment().add(30, 'days').toDate(),
        });
    }

    removeToken(): void {
        this._cookie.remove(KEY_TOKEN);
    }
}
