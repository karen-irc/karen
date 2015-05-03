import _ from 'lodash';
import fs from 'fs';
import Client from './Client';
import mkdirp from 'mkdirp';
import ConfigDriver from './adopter/ConfigDriver';
import moment from 'moment';

/**
 *  @template   T
 *  @param  {Set<T>}    set
 *  @param  {string}    path
 *  @return {Array<T>}
 */
const pluckFromSet = function (set, path) {
    const result = [];
    for (const item of set) {
        if ( item[path] !== undefined ) {
            const value = item[path];
            result.push(item);
        }
    }

    return result;
};

/**
 *  @template   T
 *  @param  {!Set<T>}    set
 *  @param  {!Object<string, *>}    predicate
 *  @return {T}
 */
const findFromSet = function (set, predicate) {
    /*eslint-disable no-labels, block-scoped-var*/
    let keys = Object.keys(predicate);
    outer: for (let item of set) {
        for (let key of keys) {
            const actual = item[key];
            const expected = predicate[key];
            if (actual !== expected) {
                continue outer;
            }
        }
        return item;
    }
    /*eslint-enable*/

    return null;
};

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
        for (let client of this._clients) {
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
        var users = this.getUsers();
        for (var i in users) {
            this.loadUser(users[i]);
        }
    }

    /**
     * @param {string} name
     * @return {void}
     */
    loadUser(name) {
        var raw = null;
        try {
            raw = fs.readFileSync(
                ConfigDriver.HOME + '/users/' + name + '.json',
                'utf-8'
            );
        }
        catch(e) {
            console.log(e);
        }

        var json = null;
        try {
            json = JSON.parse(raw);
        } catch(e) {
            console.log(e);
        }

        if (json === null) {
            return;
        }

        if (this._findClient(name) !== null) {
            return;
        }

        var user = new Client(this.sockets, name, json);
        this._clients.add(user);

        var message = 'User \'' + name + '\' loaded.';
        console.log(message);
    }

    /**
     * @return {Array}
     */
    getUsers() {
        var users = [];
        var path = ConfigDriver.HOME + '/users';
        mkdirp.sync(path);
        try {
            var files = fs.readdirSync(path);
            files.forEach(function(file) {
                if (file.indexOf('.json') !== -1) {
                    users.push(file.replace('.json', ''));
                }
            });
        } catch(e) {
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
        var users = this.getUsers();
        if (users.indexOf(name) !== -1) {
            return false;
        }
        try {
            var path = ConfigDriver.HOME + '/users';
            var user = {
                user: name,
                password: password || '',
                log: false,
                networks: []
            };
            mkdirp.sync(path);
            fs.writeFileSync(
                path + '/' + name + '.json',
                JSON.stringify(user, null, '  '),
                {mode: '0777'}
            );
        } catch(e) {
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
        var users = this.getUsers();
        if (users.indexOf(name) === -1) {
            return false;
        }
        try {
            var path = ConfigDriver.HOME + '/users/' + name + '.json';
            fs.unlinkSync(path);
        } catch(e) {
            throw e;
        }
        return true;
    }

    /**
     * @return {void}
     */
    autoload() {
        var self = this;
        setInterval(function() {
            const loaded = pluckFromSet(self._clients, 'name');
            var added = _.difference(self.getUsers(), loaded);
            _.each(added, function(name) {
                self.loadUser(name);
            });
            var removed = _.difference(loaded, self.getUsers());
            _.each(removed, function(name) {
                var client = findFromSet(self._clients, {
                    name: name
                });

                if (client) {
                    client.quit();
                    self.removeClient(client);
                    console.log(
                        'User \'' + name + '\' disconnected.'
                    );
                }
            });
        }, 1000);
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
