import _ from 'lodash';
import fs from 'fs';
import Client from './Client';
import mkdirp from 'mkdirp';
import ConfigDriver from './adopter/ConfigDriver';
import moment from 'moment';

export default class ClientManager {

    /**
     *  @constructor
     */
    constructor() {
        this.clients = [];

        /** @type   {SocketIO.Socket}   */
        this.sockets = null;
    }

    /**
     *  @param  {string} name
     *  @return {Client}
     */
    _findClient(name) {
        for (var i in this.clients) {
            var client = this.clients[i];
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
        this.clients.push(user);

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
        var loaded = [];
        setInterval(function() {
            var loaded = _.pluck(
                self.clients,
                'name'
            );
            var added = _.difference(self.getUsers(), loaded);
            _.each(added, function(name) {
                self.loadUser(name);
            });
            var removed = _.difference(loaded, self.getUsers());
            _.each(removed, function(name) {
                var client = _.find(
                    self.clients, {
                        name: name
                    }
                );
                if (client) {
                    client.quit();
                    self.clients = _.without(self.clients, client);
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
        this.clients.push(client);
    }
}
