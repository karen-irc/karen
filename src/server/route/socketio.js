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

import bcrypt from 'bcrypt-nodejs';

import {Client} from '../Client';

export function confirmAuth(config, clientManager, clientGateway) {
    clientGateway.auth().subscribe(function (data) {
        tryLogin(config, clientManager, clientGateway, data);
    });

    clientGateway.emitAuth();
}

export function initializeConnection(config, clientManager, clientGateway, serverGateway) {
    const client = new Client(serverGateway.getServer());
    clientManager.addClient(client);

    clientGateway.disconnect().subscribe(function() {
        clientManager.removeClient(client);
        client.quit();
    });

    subscribeFromClient(config, clientGateway, client);
}

async function tryLogin(config, clientManager, clientGateway, data) {
    const tryAll = Array.from(clientManager.clients).map(async function(client){
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

        const isSuccess = await trying;
        if (!isSuccess) {
            return false;
        }
        else {
            let token = '';
            if (data.remember || data.token) {
                token = client.token;
            }
            subscribeFromClient(config, clientGateway, client, token);
            return true;
        }
    });

    const result = await Promise.all(tryAll);
    const isSuccess = result.some((ok) => ok);
    if (!isSuccess) {
        // There are no succeeded clients, use authentication.
        clientGateway.emitAuth();
    }
}

function subscribeFromClient(config, clientGateway, client, token) {
    clientGateway.input().subscribe(function (data) {
        client.input(data);
    });

    clientGateway.more().subscribe(function (data) {
        client.more(data);
    });

    clientGateway.connect().subscribe(function (data) {
        client.connect(data);
    });

    clientGateway.open().subscribe(function (data) {
        client.open(data);
    });

    clientGateway.sort().subscribe(function (data) {
        client.sort(data);
    });

    clientGateway.joinClient(client.id);

    const key = (token !== undefined) ? token : '';
    clientGateway.emitInitialize(client.activeChannel,
                            client.networks,
                            key,
                            [config.defaults]);
}
