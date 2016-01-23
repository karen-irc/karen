/*eslint-disable no-sync */

import ClientManager from '../ClientManager';
import fs from 'fs';
import path from 'path';
import program from 'commander';
import ConfigDriver from '../adapter/ConfigDriver';

program
    .command('remove <name>')
    .description('Remove an existing user')
    .action(function(name) {
        const usersPath = path.join(ConfigDriver.getHome(), 'users');
        const test = path.join(usersPath, '.test');
        try {
            fs.mkdirSync(test);
            fs.rmdirSync(test);
        } catch (e) {
            console.log('');
            console.log('You have no permissions to delete from ' + usersPath);
            console.log('Try running the command as sudo.');
            console.log('');
            return;
        }
        const manager = new ClientManager();
        if (manager.removeUser(name)) {
            console.log('');
            console.log('Removed \'' + name + '\'.');
            console.log('');
        } else {
            console.log('');
            console.log('User \'' + name + '\' doesn\'t exist.');
            console.log('');
        }
    });
