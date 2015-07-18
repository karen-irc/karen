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
import 'core-js/fn/array/find';
import assign from 'object-assign';
import ChannelType from './ChannelType';

const MODES = [
    '~',
    '&',
    '@',
    '%',
    '+',
].reverse();

let id = 0;

export default class Channal {

    /**
     *  @constructor
     *  @param  {Network} network
     *  @param  {?} attr
     */
    constructor(network, attr) {
        const data = assign({
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
        const clone = assign({}, this);
        clone.messages = clone.messages.slice(-100);
        clone.network = undefined;
        return clone;
    }
}
