import fs from 'fs';
import path from 'path';
import Client from './Client';
import mkdirp from 'mkdirp';
import ConfigDriver from './adapter/ConfigDriver';
import * as Rx from 'rxjs';

/**
 *  @template   T
 *  @param  {Set<T>}    set
 *  @param  {string}    path
 *  @return {Array<T>}
 */
function pluckFromSet(set, path) {
    const result = [];
    for (const item of set) {
        if ( item[path] !== undefined ) {
            result.push(item);
        }
    }

    return result;
}

/**
 *  @template   T
 *  @param  {Array<T>}  a
 *  @param  {Array<T>}  b
 *  @return {Array<T>}
 */
function difference(a, b) {
    const diff = [];
    const base = new Set(b);
    for (const item of a) {
        if (!base.has(item)) {
            diff.push(item);
        }
    }

    return diff;
}

export default class ClientManager {

    /**
     *  @constructor
     */
    constructor() {
        /** @type   {Set<Client>}   */
        this._clients = new Set();

        /** @type   {SocketIO.Socket}   */
        this.sockets = null;
    }

    /**
     *  @return {Set<Client>}
     */
    get clients() {
        return this._clients;
    }

    /**
     *  @param  {string} name
     *  @return {Client}
     */
    _findClient(name) {
        for (const client of this._clients) {
            if (client.name === name) {
                return client;
            }
        }
        return null;
    }

    /**
     * @return {void}
     */
    loadUsers() {
        const users = this.getUsers();
        for (const i in users) {
            this.loadUser(users[i]);
        }
    }

    /**
     * @param {string} name
     * @return {void}
     */
    loadUser(name) {
        let raw = null;
        try {
            raw = fs.readFileSync(
                path.join(ConfigDriver.getHome(), 'users', name + '.json'),
                'utf-8'
            );
        }
        catch (e) {
            console.log(e);
        }

        let json = null;
        try {
            json = JSON.parse(raw);
        } catch (e) {
            console.log(e);
        }

        if (json === null) {
            return;
        }

        if (this._findClient(name) !== null) {
            return;
        }

        const user = new Client(this.sockets, name, json);
        this._clients.add(user);

        const message = 'User \'' + name + '\' loaded.';
        console.log(message);
    }

    /**
     * @return {Array}
     */
    getUsers() {
        const users = [];
        const usersPath = path.join(ConfigDriver.getHome(), 'users');
        mkdirp.sync(usersPath);
        try {
            const files = fs.readdirSync(usersPath);
            files.forEach(function(file) {
                if (file.indexOf('.json') !== -1) {
                    users.push(file.replace('.json', ''));
                }
            });
        } catch (e) {
            console.log(e);
            return null;
        }
        return users;
    }

    /**
     * @param  {string} name
     * @param  {string} password
     * @return {boolean}
     *
     * @throws {Error}
     */
    addUser(name, password) {
        const users = this.getUsers();
        if (users.indexOf(name) !== -1) {
            return false;
        }
        try {
            const usersPath = path.join(ConfigDriver.getHome(), 'users');
            const user = {
                user: name,
                password: password || '',
                log: false,
                networks: []
            };
            mkdirp.sync(usersPath);
            fs.writeFileSync(
                path.join(usersPath, name + '.json'),
                JSON.stringify(user, null, '  '),
                {mode: '0777'}
            );
        } catch (e) {
            throw e;
        }
        return true;
    }

    /**
     * @param  {string} name
     * @return {boolean}
     *
     * @throws {Error}
     */
    removeUser(name) {
        const users = this.getUsers();
        if (users.indexOf(name) === -1) {
            return false;
        }
        try {
            const userPath = path.join(ConfigDriver.getHome(), 'users', name + '.json');
            fs.unlinkSync(userPath);
        } catch (e) {
            throw e;
        }
        return true;
    }

    /**
     * @return {Rx.Subscription}
     */
    autoload() {
        return Rx.Observable.interval(1000).subscribe(() => {
            const loaded = pluckFromSet(this._clients, 'name');
            const added = difference(this.getUsers(), loaded);
            added.forEach((name) => {
                this.loadUser(name);
            });

            const removed = difference(loaded, this.getUsers());
            removed.forEach((name) => {
                const client = this._findClient(name);

                if (client) {
                    client.quit();
                    this.removeClient(client);
                    console.log('User \'' + name + '\' disconnected.');
                }
            });
        });
    }

    /**
     *  @param  {Client}    client
     *  @return {void}
     */
    addClient(client) {
        this._clients.add(client);
    }

    /**
     *  @param  {Client}    client
     *  @return {void}
     */
    removeClient(client) {
        this._clients.delete(client);
    }
}
