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
