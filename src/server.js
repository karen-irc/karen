/*eslint-disable block-scoped-var */
import _ from 'lodash';
import assign from 'object-assign';
import bcrypt from 'bcrypt-nodejs';
import Client from './Client';
import ClientManager from './ClientManager';
import SocketIoServerDriver from './adopter/SocketIoServerDriver';
import express from 'express';
import fs from 'fs';
import http from 'http';
import Helper from './helper';

let server = null;
let config = {};

let gateway = null;

const manager = new ClientManager();

export default function(options) {
    config = Helper.getConfig();
    config = assign(config, options);

    const app = express()
        .use(index)
        .use(express.static('client'));

    app.enable('trust proxy');

    const https = config.https || {};
    const protocol = https.enable ? 'https' : 'http';
    const port = config.port;
    const host = config.host;
    const transports = config.transports || ['websocket', 'polling'];

    if (!https.enable){
        server = http.createServer(app).listen(port, host);
    } else {
        server = http.createServer({
            key: fs.readFileSync(https.key),
            cert: fs.readFileSync(https.certificate)
        }, app).listen(port, host);
    }

    if ((config.identd || {}).enable) {
        require('./identd').start(config.identd.port);
    }

    gateway = new SocketIoServerDriver(server, transports);

    gateway.connect().subscribe(function(socket) {
        if (config.public) {
            auth.call(socket);
        } else {
            init(socket);
        }
    });

    manager.sockets = gateway.getServer();

    console.log('');
    console.log('karen is now running on ' + protocol + '://' + config.host + ':' + config.port + '/');
    console.log('Press ctrl-c to stop');
    console.log('');

    if (!config.public) {
        manager.loadUsers();
        if (config.autoload) {
            manager.autoload();
        }
    }
}

function index(req, res, next) {
    if (req.url.split('?')[0] !== '/') {
        return next();
    }
    return fs.readFile('client/index.html', 'utf-8', function(err, file) {
        if (!!err) {
            throw err;
        }

        var data = _.merge(
            require('../package.json'),
            config
        );
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        res.end(_.template(
            file,
            data
        ));
    });
}

/**
 *  @param  {SocketIO.Socket}   socket
 *  @param  {Client=}   client  (optional)
 *  @param  {string=}   token   (optional)
 *  @return {void}
 */
function init(socket, client, token) {
    if (!client) {
        socket.emit('auth');
        socket.on('auth', auth);
    } else {
        socket.on(
            'input',
            function(data) {
                client.input(data);
            }
        );
        socket.on(
            'more',
            function(data) {
                client.more(data);
            }
        );
        socket.on(
            'conn',
            function(data) {
                client.connect(data);
            }
        );
        socket.on(
            'open',
            function(data) {
                client.open(data);
            }
        );
        socket.on(
            'sort',
            function(data) {
                client.sort(data);
            }
        );
        socket.join(client.id);
        socket.emit('init', {
            active: client.activeChannel,
            networks: client.networks,
            token: token || ''
        });
    }
}

function auth(data) {
    const socket = this;
    if (config.public) {
        const client = new Client(gateway.getServer());
        manager.clients.push(client);
        socket.on('disconnect', function() {
            manager.clients = _.without(manager.clients, client);
            client.quit();
        });
        init(socket, client);
    } else {
        const success = false;
        _.each(manager.clients, function(client) {
            if (data.token) {
                if (data.token === client.token) {
                    success = true;
                }
            } else if (client.config.user === data.user) {
                if (bcrypt.compareSync(data.password || '', client.config.password)) {
                    success = true;
                }
            }
            if (success) {
                let token = '';
                if (data.remember || data.token) {
                    token = client.token;
                }
                init(socket, client, token);
                return false;
            }
        });
        if (!success) {
            socket.emit('auth');
        }
    }
}
