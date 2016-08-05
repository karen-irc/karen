// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
/// <reference path='../../../../node_modules/cookies-js/dist/cookies.d.ts'/>
import * as cookies from 'cookies-js';
import {Option, Some, None} from 'option-t';

export class CookieDriver {

    _cookie: CookiesStatic;

    /**
     *  @constructor
     */
    constructor() {
        this._cookie = cookies;
    }

    get(key: string): Option<any> { // tslint:disable-line:no-any
        const value: string = this._cookie.get(key);

        // By https://github.com/ScottHamper/Cookies/blob/a2b58c5a6f8/src/cookies.js#L41
        if (value === undefined) {
            return new None<any>(); // tslint:disable-line:no-any
        }

        let result: any; // tslint:disable-line:no-any
        try {
            result = JSON.parse(value);
        }
        catch (e) {
            return new None<any>(); // tslint:disable-line:no-any
        }

        return new Some<any>(result); // tslint:disable-line:no-any
    }

    set(key: string, value: any, option: CookieOptions = {}): void { // tslint:disable-line:no-any
        const encoded = JSON.stringify(value);
        this._cookie.set(key, encoded, option);
    }

    remove(key: string, option: CookieOptions = {}): void {
        this._cookie.expire(key, option);
    }
}
