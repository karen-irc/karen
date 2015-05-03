import ClientManager from '../ClientManager';
import program from 'commander';
import child from 'child_process';
import ConfigDriver from '../adopter/ConfigDriver';

program
    .command('edit <name>')
    .description('Edit user: \'' + ConfigDriver.HOME + '/users/<name>.json\'')
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
            [require('path').join(ConfigDriver.HOME, 'users', name + '.json')],
            {stdio: 'inherit'}
        );
    });
