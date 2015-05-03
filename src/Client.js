import _ from 'lodash';
import Chan from './models/Channel';
import ChannelType from './models/ChannelType';
import crypto from 'crypto';
import fs from 'fs';
import identd from './identd';
import log from './log';
import net from 'net';
import Message from './models/Message';
import MessageType from './models/MessageType';
import Network from './models/Network';
import slate from 'slate-irc';
import tls from 'tls';
import ConfigDriver from './adopter/ConfigDriver';

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
        _.merge(this, {
            activeChannel: -1,
            config: config,
            id: id++,
            name: name,
            networks: [],
            sockets: sockets
        });

        this.timer = null;

        crypto.randomBytes(48, (err, buf) => {
            if (err) {
                throw err;
            }

            this.token = buf.toString('hex');
        });

        if (config) {
            var delay = 0;
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
        var config = this.config || {};
        if (config.log === true) {
            if (event === 'msg') {
                var target = this.find(data.chan);
                if (target) {
                    var chan = target.chan.name;
                    if (target.chan.type === ChannelType.LOBBY) {
                        chan = target.network.host;
                    }
                    log.write(
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
        for (let network of this.networks) {
            let chan = _.find(network.channels, {id: id});
            if (chan) {
                return { network, chan };
            }
        }
        return false;
    }

    connect(args) {
        var config = ConfigDriver.getConfig();
        var server = {
            name: args.name || '',
            host: args.host || 'irc.freenode.org',
            port: args.port || (args.tls ? 6697 : 6667),
            rejectUnauthorized: false
        };

        if (config.bind) {
            server.localAddress = config.bind;
            if(args.tls) {
                var socket = net.connect(server);
                server.socket = socket;
            }
        }

        var stream = args.tls ? tls.connect(server) : net.connect(server);

        stream.on('error', (e) => {
            console.log('Client#connect():\n' + e);
            stream.end();
            var msg = new Message({
                type: MessageType.ERROR,
                text: 'Connection error.'
            });
            this.emit('msg', {
                msg: msg
            });
        });

        var nick = args.nick || 'karen-user';
        var username = args.username || nick.replace(/[^a-zA-Z0-9]/g, '');
        var realname = args.realname || 'karen User';

        var irc = slate(stream);
        identd.hook(stream, username);

        if (args.password) {
            irc.pass(args.password);
        }

        irc.me = nick;
        irc.nick(nick);
        irc.user(username, realname);

        var network = new Network({
            name: server.name,
            host: server.host,
            port: server.port,
            tls: !!args.tls,
            password: args.password,
            username: username,
            realname: realname,
            commands: args.commands
        });

        network.irc = irc;

        this.networks.push(network);
        this.emit('network', {
            network: network
        });

        events.forEach((plugin) => {
            var path = './plugins/irc-events/' + plugin;
            require(path).apply(this, [
                irc,
                network
            ]);
        });

        irc.once('welcome', () => {
            var delay = 1000;
            var commands = args.commands;
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
            var join = (args.join || '');
            if (join) {
                join = join.replace(/\,/g, ' ').split(/\s+/g);
                irc.join(join);
            }
        });
    }

    input(data) {
        var text = data.text.trim();
        var target = this.find(data.target);
        if (text.charAt(0) !== '/') {
            text = '/say ' + text;
        }
        var args = text.split(' ');
        var cmd = args.shift().replace('/', '').toLowerCase();
        inputs.forEach((plugin) => {
            var path = '';
            try {
                path = './plugins/inputs/' + plugin;
                var fn = require(path);
                fn.apply(this, [
                    target.network,
                    target.chan,
                    cmd,
                    args
                ]);
            } catch (e) {
                console.log(path + ': ' + e);
            }
        });
    }

    more(data) {
        var target = this.find(data.target);
        if (!target) {
            return;
        }
        var chan = target.chan;
        var count = chan.messages.length - (data.count || 0);
        var messages = chan.messages.slice(Math.max(0, count - 100), count);
        this.emit('more', {
            chan: chan.id,
            messages: messages
        });
    }

    open(data) {
        var target = this.find(data);
        if (target) {
            target.chan.unread = 0;
            this.activeChannel = target.chan.id;
        }
    }

    sort(data) {
        var type = data.type;
        var order = data.order || [];
        var sorted = null;

        switch (type) {
        case 'networks':
            sorted = [];
            order.forEach((id) => {
                var find = _.find(this.networks, { id });
                if (find) {
                    sorted.push(find);
                }
            });
            this.networks = sorted;
            break;

        case 'channels':
            var target = data.target;
            var network = _.find(this.networks, {id: target});
            if (!network) {
                return;
            }
            sorted = [];
            order.forEach((id) => {
                var find = _.find(network.channels, { id });
                if (find) {
                    sorted.push(find);
                }
            });
            network.channels = sorted;
            break;
        }
    }

    quit() {
        var sockets = this.sockets.sockets;
        var room = sockets.adapter.rooms[this.id] || [];
        for (var user in room) {
            var socket = sockets.adapter.nsp.connected[user];
            if (socket) {
                socket.disconnect();
            }
        }
        this.networks.forEach((network) => {
            var irc = network.irc;
            if (network.connected) {
                irc.quit();
            } else {
                irc.stream.end();
            }
        });
    }

    save(force) {
        var config = ConfigDriver.getConfig();

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

        var name = this.name;
        var path = ConfigDriver.HOME + '/users/' + name + '.json';

        var networks = this.networks.map((network) => network.export());

        var json = {};
        fs.readFile(path, 'utf-8', (err, data) => {
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
                path,
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
