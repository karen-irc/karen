/*eslint-disable block-scoped-var */

require('babelify/polyfill');

import _ from 'lodash';
import assign from 'object-assign';
import bcrypt from 'bcrypt-nodejs';
import compression from 'compression';
import Client from './Client';
import ClientManager from './ClientManager';
import SocketIoServerDriver from './adapter/SocketIoServerDriver';
import express from 'express';
import fs from 'fs';
import http from 'http';
import ConfigDriver from './adapter/ConfigDriver';
import Package from './adapter/Package';

let server = null;
let config = {};

let gateway = null;

const manager = new ClientManager();

export default function(options) {
    config = ConfigDriver.getConfig();
    config = assign(config, options);

    const app = express();
    app.use(compression());
    app.use(index);
    app.use(express.static('dist/client'));
    app.use(express.static('client'));

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

const cspDirective = {
    'default-src': '\'none\'',
    'connect-src': '\'self\' ws: wss:',
    'font-src': '\'self\' https://fonts.gstatic.com',

    // XXX: karen tries to expand all image which is embedded in a message.
    'img-src': '*',

    'media-src': '\'self\'',
    'script-src': '\'self\'',

    // FIXME: this 'unsfae-inline' should be removed.
    'style-src': '\'self\' https://fonts.googleapis.com \'unsafe-inline\'',
};
const cspDirectiveStr = Object.keys(cspDirective).map(function(key){
    return key + ' ' + cspDirective[key] + ';';
}).join(' ');

function index(req, res, next) {
    if (req.url.split('?')[0] !== '/') {
        return next();
    }
    return fs.readFile('client/index.html', 'utf-8', function(err, file) {
        if (!!err) {
            throw err;
        }

        const data = _.merge(_.merge({}, Package.getPackage()), config);
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Security-Policy', cspDirectiveStr);
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
        manager.addClient(client);

        socketGateway.disconnect().subscribe(function() {
            manager.removeClient(client);
            client.quit();
        });

        init(socketGateway, client);
        return;
    }

    for (const client of manager.clients) {
        let success = false;
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
            return;
        }
    }

    // There are no succeeded clients, use authentication.
    socketGateway.emitAuth();
}
