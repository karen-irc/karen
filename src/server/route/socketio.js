// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
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

function tryLogin(config, clientManager, clientGateway, data) {
    const tryAll = Array.from(clientManager.clients).map(function(client){
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
                subscribeFromClient(config, clientGateway, client, token);
                return true;
            }
        });
        return auth;
    });

    Promise.all(tryAll).then(function(result) {
        const isSuccess = result.some((ok) => ok);
        if (!isSuccess) {
            // There are no succeeded clients, use authentication.
            clientGateway.emitAuth();
        }
    });
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
