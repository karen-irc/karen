// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {Channel} from './Channel';
import {ChannelType} from './ChannelType';

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

/** @type   {number}    */
let id = 0;

export class Network {

    /**
     *  @constructor
     *  @param  {?} attr
     */
    constructor(attr) {
        const data = Object.assign({
            name: '',
            host: '',
            port: 6667,
            tls: false,
            password: '',
            commands: [],
            username: '',
            realname: '',
            channels: [],
            allowUserImage: false,
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
        this.allowUserImage = data.allowUserImage;

        /** @type   {boolean}   */
        this.connected = data.connected;

        /** @type   {?} */
        this.irc = data.irc;

        this.channels.unshift(
            new Channel(this, {
                name: this.name,
                type: ChannelType.LOBBY
            })
        );
    }

    /**
     *  @return {?}
     */
    export() {
        const network = {
            name: this.name,
            host: this.host,
            port: this.port,
            tls: this.tls,
            password: this.password,
            username: this.username,
            realname: this.realname,
            commands: this.commands,
            allowUserImage: this.allowUserImage,
        };
        network.nick = (this.irc || {}).me;
        const collection = this.channels.filter(function(element){
            return element.type === 'channel';
        });

        network.join = collection.map(function(element){
            return element.name;
        }).join(',');
        return network;
    }

    /**
     *  @return {Object}
     */
    toJSON() {
        const nickname = (!!this.irc ? this.irc.me : '');
        const json = Object.assign({nick: nickname}, this);
        json.irc = undefined;
        json.password = undefined;
        return json;
    }
}
