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
import moment from 'moment';

import {MessageType} from './MessageType';

let id = 0;

/**
 *  @param  {?Channel} channel
 *  @param  {Message} message
 *  @return {?string}
 */
function findUserImage(channel, message) {
    if (!channel) {
        return null;
    }

    if (message.type !== MessageType.MESSAGE) {
        return null;
    }

    const network = channel.network;
    if (!network.allowUserImage) {
        return null;
    }

    const hostmask = message.hostmask;
    if (!hostmask) {
        return null;
    }

    return hostmask.hostname;
}

export class Message {

    /**
     *  @constructor
     *  @param  {?Channel} channel
     *  @param  {?} attr
     */
    constructor(channel, attr) {
        const data = Object.assign({
            type: MessageType.MESSAGE,
            id: id++,
            text: '',
            time: moment().utc().format('HH:mm:ss'),
            from: '',
            mode: '',
            self: false,
            hostmask: null
        }, attr);

        /** @type   {MessageType}  */
        this.type = data.type;

        /** @type   {number}    */
        this.id = data.id;

        /** @type   {string}    */
        this.text = data.text;

        /** @type   {string}    */
        this.time = data.time;

        /** @type   {string}    */
        this.from = data.from;

        /** @type   {string}    */
        this.mode = data.mode;

        /** @type   {boolean}   */
        this.self = data.self;

        /** @type   {?Channel}  */
        this.channel = channel;

        /** @type   {?Hostmask} */
        this.hostmask = data.hostmask;

        /** @type   {?string}   */
        this.userImage = findUserImage(channel, this);
    }

    toJSON() {
        const clone = Object.assign({}, this);
        clone.channel = undefined;
        return clone;
    }
}
