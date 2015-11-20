/*eslint-disable block-scoped-var */

import bcrypt from 'bcrypt-nodejs';
import compression from 'compression';
import express from 'express';
import fs from 'fs';
import http from 'http';
import spdy from 'spdy';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';

import SocketIoServerDriver from './adapter/SocketIoServerDriver';
import ConfigDriver from './adapter/ConfigDriver';
import Package from './adapter/Package';
import { KarenAppIndex as IndexTemplate } from './view/Index';

import Client from './Client';
import ClientManager from './ClientManager';


let server = null;
let config = {};

let gateway = null;

const manager = new ClientManager();

export default function(options) {
    config = ConfigDriver.getConfig();
    config = Object.assign(config, options);

    const app = express();
    app.all('*', applyGenericSecurityHeader);
    app.use(compression());
    app.use(index);
    app.use('/dist', express.static('dist/client'));
    app.use(express.static('client'));

    app.enable('trust proxy');

    const httpsOptions = config.https || {};
    const protocol = httpsOptions.enable ? 'https' : 'http';
    const port = config.port;
    const host = config.host;
    const transports = config.transports || ['websocket', 'polling'];

    if (!httpsOptions.enable){
        server = http.createServer(app).listen(port, host);
    } else {
        server = spdy.createServer({
            key: fs.readFileSync(httpsOptions.key),
            cert: fs.readFileSync(httpsOptions.certificate)
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

const STRICT_TRANSPORT_SECURITY_EXPIRE_TIME = String(60 * 24 * 365 * 1000);

function applyGenericSecurityHeader(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Strict-Transport-Security', 'max-age=' + STRICT_TRANSPORT_SECURITY_EXPIRE_TIME + ';');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    next();
}

const cspDirective = new Map([
    ['default-src', `'none'`],
    ['connect-src', `'self' ws: wss:`],
    ['font-src', `'self' https://fonts.gstatic.com`],

    // XXX: karen tries to expand all image which is embedded in a message.
    ['img-src', `*`],

    ['media-src', `'self'`],
    ['script-src', `'self'`],

    // FIXME: this 'unsafe-inline' should be removed.
    ['style-src', '\'self\' https://fonts.googleapis.com \'unsafe-inline\''],
]);
const cspDirectiveStr = [...cspDirective.entries()].map(function([key, value]){
    return key + ' ' + value + ';';
}).join(' ');

function index(req, res, next) {
    if (req.url.split('?')[0] !== '/') {
        return next();
    }

    let data = Object.assign({}, Package.getPackage());
    data = Object.assign(data, config);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Security-Policy', cspDirectiveStr);
    res.setHeader('X-Frame-Options', 'DENY');
    res.writeHead(200);

    const view = React.createElement(IndexTemplate, {
        data: data,
    });
    const html = '<!DOCTYPE html>' + ReactDOMServer.renderToStaticMarkup(view);
    res.end(html);
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
                               key,
                               [config.defaults]);
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
