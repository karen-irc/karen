/*eslint-disable no-sync */

import ClientManager from '../ClientManager';
import bcrypt from 'bcrypt-nodejs';
import fs from 'fs';
import path from 'path';
import program from 'commander';
import mkdirp from 'mkdirp';
import ConfigDriver from '../adapter/ConfigDriver';
import read from 'read';

function add(manager, name, password) {
    console.log('');
    const salt = bcrypt.genSaltSync(8);
    const hash = bcrypt.hashSync(password, salt);
    manager.addUser(
        name,
        hash
    );
    console.log('User \'' + name + '\' created:');
    console.log(path.join(ConfigDriver.getHome(), 'users', name + '.json'));
    console.log('');
}

program
    .command('add <name>')
    .description('Add a new user')
    .action(function(name) {
        const usersPath = path.join(ConfigDriver.getHome(), 'users');
        try {
            mkdirp.sync(usersPath);
        } catch (e) {
            console.log('');
            console.log('Could not create ' + usersPath);
            console.log('Try running the command as sudo.');
            console.log('');
            return;
        }
        try {
            const test = path.join(usersPath, '.test');
            fs.mkdirSync(test);
            fs.rmdirSync(test);
        } catch (e) {
            console.log('');
            console.log('You have no permissions to write to ' + usersPath);
            console.log('Try running the command as sudo.');
            console.log('');
            return;
        }
        const manager = new ClientManager();
        const users = manager.getUsers();
        if (users.indexOf(name) !== -1) {
            console.log('');
            console.log('User \'' + name + '\' already exists.');
            console.log('');
            return;
        }

        const param = {
            prompt: 'Password: ',
            silent: true
        };
        read(param, function(err, password) {
            if (!err) {
                add(manager, name, password);
            }
        });
    });
