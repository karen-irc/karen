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

/// <reference path="../../../tsd/object-assign.d.ts" />

import assign from 'object-assign';

export default class Setting {

    badge: boolean;
    colors: boolean;
    join: boolean;
    links: boolean;
    mode: boolean;
    motd: boolean;
    nick: boolean;
    notification: boolean;
    part: boolean;
    thumbnails: boolean;
    quit: boolean;

    /**
     *  @constructor
     *  @param  {Object}    raw
     */
    constructor(raw: any) {
        const data = assign({
            badge: false,
            colors: false,
            join: true,
            links: true,
            mode: true,
            motd: false,
            nick: true,
            notification: true,
            part: true,
            thumbnails: true,
            quit: true,
        }, raw);

        /** @type   {boolean}   */
        this.badge = data.badge;

        /** @type   {boolean}   */
        this.colors = data.colors;

        /** @type   {boolean}   */
        this.join = data.join;

        /** @type   {boolean}   */
        this.links = data.links;

        /** @type   {boolean}   */
        this.mode = data.mode;

        /** @type   {boolean}   */
        this.motd = data.motd;

        /** @type   {boolean}   */
        this.nick = data.nick;

        /** @type   {boolean}   */
        this.notification = data.notification;

        /** @type   {boolean}   */
        this.part = data.part;

        /** @type   {boolean}   */
        this.thumbnails = data.thumbnails;

        /** @type   {boolean}   */
        this.quit = data.quit;
    }
}
