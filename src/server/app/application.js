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
/// <reference path='../../../typings/index.d.ts'/>

import bodyParser from 'body-parser';
import compression from 'compression';
import * as fs from 'fs';
import express from 'express';
import * as http from 'http';
import * as spdy from 'spdy';

import ConfigDriver from '../adapter/ConfigDriver';
import {SocketIoServerDriver} from '../adapter/SocketIoServerDriver';

import {routeIndex} from '../route/router';
import {confirmAuth, initializeConnection} from '../route/socketio';

import {ClientManager} from '../ClientManager';

import {
    applyGenericSecurityHeader,
    setSessionMiddleware,
    checkSessionMiddleware,
    trySignIn,
    doSignout
} from './security';

export class KarenServer {

    constructor(options) {
        const config = ConfigDriver.getConfig();

        this._config = Object.assign(config, options);
        this._express = createExpress(this._config);
        this._server = createServer(this._express, this._config);
        this._socketIo = createSocketIo(this._server, this._config);
        this._manager = new ClientManager();

        this._subscription = this._init();
    }

    _init() {
        this._initRouting();
        this._manager.sockets = this._socketIo.getServer();

        const subscription = this._socketIo.connect().subscribe((gateway) => {
            if (this._config.public) {
                this._initConnection(gateway);
            } else {
                this._confirmAuth(gateway);
            }
        });
        return subscription;
    }

    _initRouting() {
        const app = this._express;
        app.use((req, res, next) => {
            routeIndex(this._config, req, res, next);
        });
        app.use('/dist/js', express.static('__dist/client'));
        app.use('/dist/css', express.static('__dist/style'));
        app.use(express.static('resource'));
        app.use('/resource/fonts/font-awesome', express.static('node_modules/font-awesome/fonts'));

        app.use('/api/', bodyParser.json());
        app.post('/api/auth/signin', trySignIn);
        app.get('/api/auth/signout', doSignout);
        app.use('/api/', checkSessionMiddleware); // apply to `/api/*` routes from here.
    }

    _initConnection(clientGateway) {
        initializeConnection(this._config, this._manager, clientGateway, this._socketIo);
    }

    _confirmAuth(clientGateway) {
        confirmAuth(this._config, this._manager, clientGateway);
    }

    config() {
        return this._config;
    }

    server() {
        return this._server;
    }

    socketIo() {
        return this._socketIo;
    }

    clientManager() {
        return this._manager;
    }
}

function createExpress(config) {
    const app = express();
    app.set('x-powered-by', false);
    app.use(applyGenericSecurityHeader);
    app.use(compression());

    setSessionMiddleware(app, config);

    return app;
}

function createServer(express, config) {
    const httpsOptions = config.https || {};
    const port = config.port;
    const host = config.host;

    let server = null;
    if (!httpsOptions.enable){
        server = http.createServer(express).listen(port, host);
    } else {
        /*eslint-disable no-sync*/
        // We can wait the synchronous call in the start up time.
        server = spdy.createServer({
            key: fs.readFileSync(httpsOptions.key),
            cert: fs.readFileSync(httpsOptions.certificate)
        }, express).listen(port, host);
        /*eslint-enable */
    }

    return server;
}

function createSocketIo(server, config) {
    const transports = config.transports || ['websocket', 'polling'];
    const driver = new SocketIoServerDriver(server, transports);
    return driver;
}
