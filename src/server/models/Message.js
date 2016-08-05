// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
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
