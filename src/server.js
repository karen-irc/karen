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
import ConfigDriver from './adopter/ConfigDriver';

let server = null;
let config = {};

let gateway = null;

const manager = new ClientManager();

export default function(options) {
    config = ConfigDriver.getConfig();
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

    gateway.connect().subscribe(function(gateway) {
        if (config.public) {
            auth(gateway);
        } else {
            init(gateway);
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
 *  @param  {ClientSocketDriver}   gateway
 *  @param  {Client=}   client  (optional)
 *  @param  {string=}   token   (optional)
 *  @return {void}
 */
function init(gateway, client, token) {
    if (!client) {
        gateway.auth().subscribe(function (data) {
            auth(gateway, data);
        });

        gateway.emitAuth();
    } else {
        gateway.input().subscribe(function (data) {
            client.input(data);
        });

        gateway.more().subscribe(function (data) {
            client.more(data);
        });

        gateway.connect().subscribe(function (data) {
            client.connect(data);
        });

        gateway.open().subscribe(function (data) {
            client.open(data);
        });

        gateway.sort().subscribe(function (data) {
            client.sort(data);
        });

        gateway.joinClient(client.id);

        const key = (token !== undefined) ? token : '';
        gateway.emitInitialize(client.activeChannel,
                               client.networks,
                               key);
    }
}

/**
 *  @param  {ClientSocketDriver}   socketGateway
 *  @param  {?} data
 *  @return {void}
 */
function auth(socketGateway, data) {
    if (config.public) {
        const client = new Client(gateway.getServer());
        manager.clients.push(client);

        socketGateway.disconnect().subscribe(function() {
            manager.clients = _.without(manager.clients, client);
            client.quit();
        });

        init(socketGateway, client);
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
                init(socketGateway, client, token);
                return false;
            }
        });
        if (!success) {
            socketGateway.emitAuth();
        }
    }
}
