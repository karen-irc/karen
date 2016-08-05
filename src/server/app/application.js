// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
/// <reference path='../../../typings/index.d.ts'/>

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

import {applyGenericSecurityHeader, setSessionMiddleware} from './security';

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
        app.use('/dist', express.static('__dist/client'));
        app.use(express.static('src/client'));
        app.use(express.static('resource'));
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
