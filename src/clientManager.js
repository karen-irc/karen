/*eslint quotes: [2, "single"]*/
'use strict';

var _ = require('lodash');
var fs = require('fs');
var Client = require('./client');
var mkdirp = require('mkdirp');
var Helper = require('./helper');
var moment = require('moment');

module.exports = ClientManager;

/**
 *  @constructor
 */
function ClientManager() {
    this.clients = [];
}

/**
 *  @param  {string} name
 *  @return {Client}
 */
ClientManager.prototype._findClient = function(name) {
    for (var i in this.clients) {
        var client = this.clients[i];
        if (client.name === name) {
            return client;
        }
    }
    return null;
};

/**
 * @return {void}
 */
ClientManager.prototype.loadUsers = function() {
    var users = this.getUsers();
    for (var i in users) {
        this.loadUser(users[i]);
    }
};

/**
 * @param {string} name
 * @return {void}
 */
ClientManager.prototype.loadUser = function(name) {
    var raw = null;
    try {
        raw = fs.readFileSync(
            Helper.HOME + '/users/' + name + '.json',
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
};

/**
 * @return {Array}
 */
ClientManager.prototype.getUsers = function() {
    var users = [];
    var path = Helper.HOME + '/users';
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
};

/**
 * @param  {string} name
 * @param  {string} password
 * @return {boolean}
 *
 * @throws {Error}
 */
ClientManager.prototype.addUser = function(name, password) {
    var users = this.getUsers();
    if (users.indexOf(name) !== -1) {
        return false;
    }
    try {
        var path = Helper.HOME + '/users';
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
};

/**
 * @param  {string} name
 * @return {boolean}
 *
 * @throws {Error}
 */
ClientManager.prototype.removeUser = function(name) {
    var users = this.getUsers();
    if (users.indexOf(name) === -1) {
        return false;
    }
    try {
        var path = Helper.HOME + '/users/' + name + '.json';
        fs.unlinkSync(path);
    } catch(e) {
        throw e;
    }
    return true;
};

/**
 * @return {void}
 */
ClientManager.prototype.autoload = function() {
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
};

