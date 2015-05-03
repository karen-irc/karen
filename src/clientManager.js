import _ from 'lodash';
import fs from 'fs';
import Client from './client';
import mkdirp from 'mkdirp';
import Helper from './helper';
import moment from 'moment';

export default class ClientManager {

    /**
     *  @constructor
     */
    constructor() {
        this.clients = [];
    }

    /**
     *  @param  {string} name
     *  @return {Client}
     */
    _findClient(name) {
        for (const client of this.clients) {
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
        let users = this.getUsers();
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
                Helper.HOME + '/users/' + name + '.json',
                'utf-8'
            );
        }
        catch(e) {
            console.log(e);
        }

        let json = null;
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

        const user = new Client(this.sockets, name, json);
        this.clients.push(user);

        const message = 'User \'' + name + '\' loaded.';
        console.log(message);
    }

    /**
     * @return {Array}
     */
    getUsers() {
        const users = [];
        const path = Helper.HOME + '/users';
        mkdirp.sync(path);
        try {
            const files = fs.readdirSync(path);
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
        const users = this.getUsers();
        if (users.indexOf(name) !== -1) {
            return false;
        }

        try {
            const path = Helper.HOME + '/users';
            const user = {
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
        const users = this.getUsers();
        if (users.indexOf(name) === -1) {
            return false;
        }
        try {
            const path = Helper.HOME + '/users/' + name + '.json';
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
        setInterval(() => {
            const loaded = _.pluck(this.clients, 'name');
            const added = _.difference(this.getUsers(), loaded);

            _.each(added, (name) => {
                this.loadUser(name);
            });

            const removed = _.difference(loaded, this.getUsers());
            _.each(removed, (name) => {
                const client = _.find(this.clients, {
                    name: name
                });
                if (client) {
                    client.quit();
                    this.clients = _.without(this.clients, client);
                    console.log('User \'' + name + '\' disconnected.');
                }
            });
        }, 1000);
    }
}
