// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {ChannelType} from './ChannelType';

const MODES = [
    '~',
    '&',
    '@',
    '%',
    '+',
].reverse();

let id = 0;

export class Channel {

    /**
     *  @constructor
     *  @param  {Network} network
     *  @param  {?} attr
     */
    constructor(network, attr) {
        const data = Object.assign({
            id: id++,
            messages: [],
            name: '',
            topic: '',
            type: ChannelType.CHANNEL,
            unread: 0,
            users: []
        }, attr);

        /** @type   {number}    */
        this.id = data.id;

        /** @type   {string}    */
        this.name = data.name;

        /** @type   {string}    */
        this.topic = data.topic;

        /** @type   {ChannelType}    */
        this.type = data.type;

        /** @type   {Array}    */
        this.messages = data.messages;

        /** @type   {number}    */
        this.unread = data.unread;

        /** @type   {Array}    */
        this.users = data.users;

        /** @type   {Network}    */
        this.network = network;
    }

    /**
     *  @return {void}
     */
    sortUsers() {
        this.users = this.users.sort(function(a, b) {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();

            if (aName < bName) {
                return -1;
            }
            else if (aName > bName) {
                return 1;
            }
            else {
                return 0;
            }
        });

        MODES.forEach(function(mode) {
            const filtered = [];
            const removed = [];

            this.users.forEach(function(u) {
                if (u.mode === mode) {
                    removed.push(u);
                }
                else {
                    filtered.push(u);
                }
            });

            this.users = removed.concat(filtered);
        }, this);
    }

    /**
     *  @param  {string}    name
     *  @return {string}
     */
    getMode(name) {
        const user = this.users.find(function(element){
            return element.name === name;
        });
        if (!!user) {
            return user.mode;
        }
        else {
            return '';
        }
    }

    /**
     *  @return {Channal}
     */
    toJSON() {
        const clone = Object.assign({}, this);
        clone.messages = clone.messages.slice(-100);
        clone.network = undefined;
        return clone;
    }
}
