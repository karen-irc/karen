import bcrypt from 'bcrypt-nodejs';
import ClientManager from '../ClientManager';
import fs from 'fs';
import path from 'path';
import program from 'commander';
import ConfigDriver from '../adopter/ConfigDriver';
import read from 'read';

program
    .command('reset <name>')
    .description('Reset user password')
    .action(function(name) {
        const users = new ClientManager().getUsers();
        if (users.indexOf(name) === -1) {
            console.log('');
            console.log('User \'' + name + '\' doesn\'t exist.');
            console.log('');
            return;
        }
        const file = path.join(ConfigDriver.getHome(), 'users', name + '.json');
        const user = require(file);

        const param = {
            prompt: 'Password: ',
            silent: true,
        };
        read(param, function(err, password) {
            console.log('');
            if (err) {
                return;
            }

            const salt = bcrypt.genSaltSync(8);
            const hash = bcrypt.hashSync(password, salt);
            user.password = hash;
            fs.writeFileSync(
                file,
                JSON.stringify(user, null, '  '),
                {mode: '0777'}
            );
            console.log('Successfully reset password for \'' + name + '\'.');
            console.log('');
        });
    });
