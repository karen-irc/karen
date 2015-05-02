import bcrypt from 'bcrypt-nodejs';
import ClientManager from '../clientManager';
import fs from 'fs';
import program from 'commander';
import Helper from '../helper';

program
    .command('reset <name>')
    .description('Reset user password')
    .action(function(name) {
        var users = new ClientManager().getUsers();
        if (users.indexOf(name) === -1) {
            console.log('');
            console.log('User \'' + name + '\' doesn\'t exist.');
            console.log('');
            return;
        }
        var file = Helper.HOME + '/users/' + name + '.json';
        var user = require(file);
        require('read')({
            prompt: 'Password: ',
            silent: true
        }, function(err, password) {
            console.log('');
            if (err) {
                return;
            }
            var salt = bcrypt.genSaltSync(8);
            var hash = bcrypt.hashSync(password, salt);
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
