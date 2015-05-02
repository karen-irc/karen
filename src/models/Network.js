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
'use strict';

const _ = require("lodash");
const assign = require("object-assign");
const Chan = require("./Channel");
const ChannelType = require('./ChannelType');

let id = 0;

function Network(attr) {
    _.merge(this, assign({
        name: "",
        host: "",
        port: 6667,
        tls: false,
        password: "",
        commands: [],
        username: "",
        realname: "",
        channels: [],
        connected: false,
        id: id++,
        irc: null,
    }, attr));
    this.name = attr.name || prettify(attr.host);
    this.channels.unshift(
        new Chan({
            name: this.name,
            type: ChannelType.LOBBY
        })
    );
}

Network.prototype.toJSON = function() {
    let json = assign(this, {nick: (this.irc || {}).me || ""});
    return _.omit(json, "irc", "password");
};

Network.prototype.export = function() {
    let network = _.pick(this, [
        "name",
        "host",
        "port",
        "tls",
        "password",
        "username",
        "realname",
        "commands"
    ]);
    network.nick = (this.irc || {}).me;
    network.join = _.pluck(
        _.where(this.channels, {type: "channel"}),
        "name"
    ).join(",");
    return network;
};

function prettify(host) {
    let name = capitalize(host.split(".")[1]);
    if (!name) {
        name = host;
    }
    return name;
}

function capitalize(str) {
    if (typeof str === "string") {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

module.exports = Network;
