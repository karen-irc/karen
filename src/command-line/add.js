import ClientManager from '../clientManager';
import bcrypt from 'bcrypt-nodejs';
import fs from 'fs';
import program from 'commander';
import mkdirp from 'mkdirp';
import Helper from '../helper';

function add(manager, name, password) {
    console.log('');
    var salt = bcrypt.genSaltSync(8);
    var hash = bcrypt.hashSync(password, salt);
    manager.addUser(
        name,
        hash
    );
    console.log('User \'' + name + '\' created:');
    console.log(Helper.HOME + '/users/' + name + '.json');
    console.log('');
}

program
    .command('add <name>')
    .description('Add a new user')
    .action(function(name, password) {
        var path = Helper.HOME + '/users';
        try {
            mkdirp.sync(path);
        } catch (e) {
            console.log('');
            console.log('Could not create ' + path);
            console.log('Try running the command as sudo.');
            console.log('');
            return;
        }
        try {
            var test = path + '/.test';
            fs.mkdirSync(test);
            fs.rmdirSync(test);
        } catch (e) {
            console.log('');
            console.log('You have no permissions to write to ' + path);
            console.log('Try running the command as sudo.');
            console.log('');
            return;
        }
        var manager = new ClientManager();
        var users = manager.getUsers();
        if (users.indexOf(name) !== -1) {
            console.log('');
            console.log('User \'' + name + '\' already exists.');
            console.log('');
            return;
        }
        require('read')({
            prompt: 'Password: ',
            silent: true
        }, function(err, password) {
            if (!err) {
                add(manager, name, password);
            }
        });
    });
