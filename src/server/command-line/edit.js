import {ClientManager} from '../ClientManager';
import program from 'commander';
import child from 'child_process';
import path from 'path';
import ConfigDriver from '../adapter/ConfigDriver';

program
    .command('edit <name>')
    .description('Edit user: \'' + ConfigDriver.getHome() + '/users/<name>.json\'')
    .action(function(name) {
        const users = new ClientManager().getUsers();
        if (users.indexOf(name) === -1) {
            console.log('');
            console.log('User \'' + name + '\' doesn\'t exist.');
            console.log('');
            return;
        }
        child.spawn(
            process.env.EDITOR || 'vi',
            [path.join(ConfigDriver.getHome(), 'users', name + '.json')],
            {stdio: 'inherit'}
        );
    });
