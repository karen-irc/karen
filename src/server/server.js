/*eslint-disable block-scoped-var */

import bcrypt from 'bcrypt-nodejs';
import compression from 'compression';
import express from 'express';
import fs from 'fs';
import http from 'http';
import spdy from 'spdy';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';

import {SocketIoServerDriver} from './adapter/SocketIoServerDriver';
import ConfigDriver from './adapter/ConfigDriver';
import Package from './adapter/Package';

import {applyGenericSecurityHeader, applyHtmlSecurtyHeader} from './app/security';

import { KarenAppIndex as IndexTemplate } from './view/classic/Index';
import {RizeIndex} from './view/rize/RizeIndex';

import {Client} from './Client';
import {ClientManager} from './ClientManager';

const isEnableRize = process.env.ENABLE_RIZE === '1';

let server = null;
let config = {};

let gateway = null;

const manager = new ClientManager();

export default function(options) {
    config = ConfigDriver.getConfig();
    config = Object.assign(config, options);

    const app = express();
    app.set('x-powered-by', false);
    app.use(applyGenericSecurityHeader);
    app.use(compression());
    app.use(index);
    app.use('/dist', express.static('dist/client'));
    app.use(express.static('src/client'));

    app.enable('trust proxy');

    const httpsOptions = config.https || {};
    const protocol = httpsOptions.enable ? 'https' : 'http';
    const port = config.port;
    const host = config.host;
    const transports = config.transports || ['websocket', 'polling'];

    if (!httpsOptions.enable){
        server = http.createServer(app).listen(port, host);
    } else {
        /*eslint-disable no-sync*/
        // We can wait the synchronous call in the start up time.
        server = spdy.createServer({
            key: fs.readFileSync(httpsOptions.key),
            cert: fs.readFileSync(httpsOptions.certificate)
        }, app).listen(port, host);
        /*eslint-enable */
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
        next();
        return;
    }

    let data = Object.assign({}, Package.getPackage());
    data = Object.assign(data, config);
    res.setHeader('Content-Type', 'text/html');
    applyHtmlSecurtyHeader(req, res);
    res.writeHead(200);

    const view = isEnableRize ?
        React.createElement(RizeIndex, null) :
        React.createElement(IndexTemplate, {
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

    const tryAll = Array.from(manager.clients).map(function(client){
        const trying = new Promise(function(resolve, reject){
            if (!!data.token && data.token === client.token) {
                resolve(true);
            } else if (client.config.user === data.user) {
                bcrypt.compare((data.password || ''), client.config.password, function(err, res) {
                    if (!!err) {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
            }
            else {
                resolve(false);
            }
        });
        const auth = trying.then(function(isSuccess){
            if (!isSuccess) {
                return false;
            }
            else {
                let token = '';
                if (data.remember || data.token) {
                    token = client.token;
                }
                init(socketGateway, client, token);
                return true;
            }
        });
        return auth;
    });

    Promise.all(tryAll).then(function(result) {
        const isSuccess = result.some((ok) => ok);
        if (!isSuccess) {
            // There are no succeeded clients, use authentication.
            socketGateway.emitAuth();
        }
    });
}
