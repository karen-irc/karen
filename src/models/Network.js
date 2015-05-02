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

import _ from 'lodash';
import assign from 'object-assign';
import Channel from './Channel';
import ChannelType from './ChannelType';

/** @type   {number}    */
let id = 0;

/**
 *  @param  {string}    str
 *  @return {string}
 *  @throws {Error}
 */
function capitalize(str) {
    if (typeof str !== 'string') {
        throw new Error();
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 *  @param  {string}    host
 *  @return {string}
 */
function prettify(host) {
    let name = capitalize(host.split('.')[1]);
    if (!name) {
        name = host;
    }
    return name;
}

/**
 *  @constructor
 *  @param  {Object} attr
 */
export default function Network(attr) {
    let data = assign({
        name: '',
        host: '',
        port: 6667,
        tls: false,
        password: '',
        commands: [],
        username: '',
        realname: '',
        channels: [],
        connected: false,
        id: id++,
        irc: null,
    }, attr);

    /** @type   {number}    */
    this.id = data.id;

    /** @type   {string}    */
    this.name = (data.name !== '') ? data.name : prettify(data.host);

    /** @type   {string}    */
    this.host = data.host;

    /** @type   {number}    */
    this.port = data.port;

    /** @type   {boolean}   */
    this.tls = data.tls;

    /** @type   {string}    */
    this.password = data.password;

    /** @type   {Array} */
    this.commands = data.commands;

    // FIXME: create the object which represents user account information.

    /** @type   {string}  */
    this.username = data.username;

    /** @type   {string}    */
    this.realname = data.realname;

    /** @type   {Array<Channel>} */
    this.channels = data.channels;

    /** @type   {boolean}   */
    this.connected = data.connected;

    /** @type   {?} */
    this.irc = data.irc;

    this.channels.unshift(
        new Channel({
            name: this.name,
            type: ChannelType.LOBBY
        })
    );
}
Network.prototype = {

    /**
     *  @return {?}
     */
    export: function() {
        let network = _.pick(this, [
            'name',
            'host',
            'port',
            'tls',
            'password',
            'username',
            'realname',
            'commands'
        ]);
        network.nick = (this.irc || {}).me;
        network.join = _.pluck(
            _.where(this.channels, {type: 'channel'}),
            'name'
        ).join(',');
        return network;
    },

    /**
     *  @return {Object}
     */
    toJSON: function() {
        let json = assign(this, {nick: (this.irc || {}).me || ''});
        return _.omit(json, 'irc', 'password');
    },
};
