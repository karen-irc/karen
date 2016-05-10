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

export class Setting {

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

    constructor(raw: any) {
        const data = Object.assign({
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

        this.badge = data.badge;

        this.colors = data.colors;

        this.join = data.join;

        this.links = data.links;

        this.mode = data.mode;

        this.motd = data.motd;

        this.nick = data.nick;

        this.notification = data.notification;

        this.part = data.part;

        this.thumbnails = data.thumbnails;

        this.quit = data.quit;
    }
}

export interface MessageSetting {
    showJoin: boolean;
    showPart: boolean;
    showMode: boolean;
    showMotd: boolean;
    showNickChange: boolean;
    showQuit: boolean;
}

export interface VisualSetting {
    enableNickColorful: boolean;
}

export interface LinkContentSetting {
    autoExpandThumbnail: boolean;
    autoExpandLinks: boolean;
}

export interface NotificationSetting {
    badge: boolean;
    notification: boolean;
}