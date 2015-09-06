import 'core-js/fn/array/find';
import assign from 'object-assign';
import {Some, None} from 'option-t';
import ChannelType from './models/ChannelType';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Logger from './Logger';
import net from 'net';
import Message from './models/Message';
import MessageType from './models/MessageType';
import Network from './models/Network';
import slate from 'slate-irc';
import tls from 'tls';
import ConfigDriver from './adapter/ConfigDriver';

let id = 0;
const events = [
    'ctcp',
    'error',
    'join',
    'kick',
    'mode',
    'motd',
    'message',
    'link',
    'names',
    'nick',
    'notice',
    'part',
    'quit',
    'topic',
    'welcome',
    'whois'
];
const inputs = [
    'action',
    'connect',
    'invite',
    'join',
    'kick',
    'mode',
    'msg',
    'nick',
    'notice',
    'part',
    'quit',
    'raw',
    'services',
    'topic',
    'whois'
];

export default class Client {
    constructor(sockets, name, config) {
        assign(this, {
            config: config,
            id: id++,
            name: name,
            networks: [],
            sockets: sockets
        });

        this.activeChannel = new None();
        this.timer = null;

        crypto.randomBytes(48, (err, buf) => {
            if (err) {
                throw err;
            }

            this.token = buf.toString('hex');
        });

        if (config) {
            let delay = 0;
            (config.networks || []).forEach((n) => {
                setTimeout(() => {
                    this.connect(n);
                }, delay);
                delay += 1000;
            });
        }
    }

    emit(event, data) {
        if (this.sockets !== null) {
            this.sockets.in(this.id).emit(event, data);
        }
        const config = this.config || {};
        if (config.log === true) {
            if (event === 'msg') {
                const target = this.find(data.chan);
                if (target) {
                    let chan = target.chan.name;
                    if (target.chan.type === ChannelType.LOBBY) {
                        chan = target.network.host;
                    }
                    Logger.write(
                        this.name,
                        target.network.host,
                        chan,
                        data.msg
                    );
                }
            }
        }
    }

    find(id) {
        const findFn = function (element) {
            return element.id === id;
        };
        for (const network of this.networks) {
            const chan = network.channels.find(findFn);
            if (chan) {
                return { network, chan };
            }
        }
        return false;
    }

    connect(args) {
        const config = ConfigDriver.getConfig();
        const server = {
            name: args.name || '',
            host: args.host || 'irc.freenode.org',
            port: args.port || (args.tls ? 6697 : 6667),
            rejectUnauthorized: false
        };

        if (config.bind) {
            server.localAddress = config.bind;
            if(args.tls) {
                const socket = net.connect(server);
                server.socket = socket;
            }
        }

        const stream = args.tls ? tls.connect(server) : net.connect(server);

        stream.on('error', (e) => {
            console.log('Client#connect():\n' + e);
            stream.end();
            const msg = new Message(null, {
                type: MessageType.ERROR,
                text: 'Connection error.'
            });
            this.emit('msg', {
                msg: msg
            });
        });

        const nick = args.nick || 'karen-user';
        const username = args.username || nick.replace(/[^a-zA-Z0-9]/g, '');
        const realname = args.realname || 'karen User';

        const irc = slate(stream);

        if (args.password) {
            irc.pass(args.password);
        }

        irc.me = nick;
        irc.nick(nick);
        irc.user(username, realname);

        const network = new Network({
            name: server.name,
            host: server.host,
            port: server.port,
            tls: !!args.tls,
            password: args.password,
            username: username,
            realname: realname,
            commands: args.commands,
            allowUserImage: args.allowUserImage
        });

        network.irc = irc;

        this.networks.push(network);
        this.emit('network', {
            network: network
        });

        events.forEach((plugin) => {
            const pluginPath = './plugins/irc-events/' + plugin;
            require(pluginPath).apply(this, [
                irc,
                network
            ]);
        });

        irc.once('welcome', () => {
            let delay = 1000;
            const commands = args.commands;
            if (Array.isArray(commands)) {
                commands.forEach((cmd) => {
                    setTimeout(() => {
                        this.input({
                            target: network.channels[0].id,
                            text: cmd
                        });
                    }, delay);
                    delay += 1000;
                });
            }
            setTimeout(() => {
                irc.write('PING ' + network.host);
            }, delay);
        });

        irc.once('pong', () => {
            let join = (args.join || '');
            if (join) {
                join = join.replace(/\,/g, ' ').split(/\s+/g);
                irc.join(join);
            }
        });
    }

    input(data) {
        let text = data.text.trim();
        const target = this.find(data.target);
        if (text.charAt(0) !== '/') {
            text = '/say ' + text;
        }
        const args = text.split(' ');
        const cmd = args.shift().replace('/', '').toLowerCase();
        inputs.forEach((plugin) => {
            let pluginPath = '';
            try {
                pluginPath = './plugins/inputs/' + plugin;
                const fn = require(pluginPath);
                fn.apply(this, [
                    target.network,
                    target.chan,
                    cmd,
                    args
                ]);
            } catch (e) {
                console.log(pluginPath + ': ' + e);
            }
        });
    }

    more(data) {
        const target = this.find(data.target);
        if (!target) {
            return;
        }
        const chan = target.chan;
        const count = chan.messages.length - (data.count || 0);
        const messages = chan.messages.slice(Math.max(0, count - 100), count);
        this.emit('more', {
            chan: chan.id,
            messages: messages
        });
    }

    open(data) {
        const target = this.find(data);
        if (target) {
            target.chan.unread = 0;
            this.activeChannel = new Some(target.chan.id);
        }
    }

    sort(data) {
        const type = data.type;
        const order = data.order || [];
        let sorted = null;

        switch (type) {
            /* eslint-disable indent */
            case 'networks': {
            /* eslint-enable */
                sorted = [];
                order.forEach((id) => {
                    const find = this.networks.find(function(element){
                        return element.id === id;
                    });
                    if (find) {
                        sorted.push(find);
                    }
                });
                this.networks = sorted;
                break;
            }

            /* eslint-disable indent */
            case 'channels': {
            /* eslint-enable */
                const target = data.target;
                const network = this.networks.find(function(element){
                    return element.id === target;
                });
                if (!network) {
                    return;
                }
                sorted = [];
                order.forEach((id) => {
                    const find = network.channels.find(function(element){
                        return element.id === id;
                    });
                    if (find) {
                        sorted.push(find);
                    }
                });
                network.channels = sorted;
                break;
            }
        }
    }

    quit() {
        const sockets = this.sockets.sockets;
        const room = sockets.adapter.rooms[this.id] || [];
        for (const user in room) {
            const socket = sockets.adapter.nsp.connected[user];
            if (socket) {
                socket.disconnect();
            }
        }
        this.networks.forEach((network) => {
            const irc = network.irc;
            if (network.connected) {
                irc.quit();
            } else {
                irc.stream.end();
            }
        });
    }

    save(force) {
        const config = ConfigDriver.getConfig();

        if(config.public) {
            return;
        }

        if (!force) {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.save(true);
            }, 1000);
            return;
        }

        const name = this.name;
        const userPath = path.join(ConfigDriver.getHome(), 'users', name + '.json');

        const networks = this.networks.map((network) => network.export());

        let json = {};
        fs.readFile(userPath, 'utf-8', (err, data) => {
            if (err) {
                console.log(err);
                return;
            }

            try {
                json = JSON.parse(data);
                json.networks = networks;
            } catch(e) {
                console.log(e);
                return;
            }

            fs.writeFile(
                userPath,
                JSON.stringify(json, null, '  '),
                {mode: '0777'},
                (err) => {
                    if (err) {
                        console.log(err);
                    }
                }
            );
        });
    }
}
