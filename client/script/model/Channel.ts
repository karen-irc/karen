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

import Network from './Network';
import User from './User';

export default class Channel {
    id: number;
    name: string;
    topic: string;
    type: string;
    _userList: Array<User>;
    _unread: number;
    _messageBuffer: Array<any>;
    network: Network;

    /**
     *  @constructor
     *  @param  {Network}   network
     *  @param  {Object}    raw
     */
    constructor(network: Network, raw: any) {
        /** @type   {number}    */
        this.id = raw.id;

        /** @type   {string}    */
        this.name = raw.name;

        /** @type   {string} */
        this.topic = raw.topic;

        /** @type   {string}  */
        this.type = raw.type;

        const userList: Array<User> = raw.users.map(function(item: any) {
            const user = new User(item);
            return user;
        });
        /** @type Array<User>   **/
        this._userList = userList;

        /** @type   {number}    */
        this._unread = raw.unread;

        let messages: Array<any> = null;
        if (Array.isArray(raw.messages)) {
            messages = raw.messages;
        }
        else {
            messages = [];
        }

        /** @type   {Array<Message>}    */
        this._messageBuffer = messages;

        /** @type   {Network}   */
        this.network = network;
    }

    /**
     *  @deprecated
     *  @return {number}
     */
    get unread(): number {
        return this.getUnread();
    }

    /**
     *  @deprecated
     *  @return {Array<Message>}
     */
    get messages(): Array<any> {
        return this._messageBuffer;
    }

    /**
     *  @return {number}
     */
    getUnread(): number {
        return this._unread;
    }

    /**
     *  @return {Array<User>}
     */
    getUserList(): Array<User> {
        return this._userList;
    }

    /**
     *  @param  {Array<User>}   list
     *  @return {void}
     */
    updateUserList(list: Array<User>): void {
        this._userList = list;
    }
}
