import _ from 'lodash';
import ClientManager from '../ClientManager';
import program from 'commander';
import karen from '../server';
import ConfigDriver from '../adopter/ConfigDriver';

program
    .option('-H, --host <ip>', 'host')
    .option('-P, --port <port>', 'port')
    .option('-B, --bind <ip>', 'bind')
    .option('    --public', 'mode')
    .option('    --private', 'mode')
    .command('start')
    .description('Start the server')
    .action(function() {
        const users = new ClientManager().getUsers();
        const config = ConfigDriver.getConfig();
        let mode = config.public;
        if (program.public) {
            mode = true;
        } else if (program.private) {
            mode = false;
        }
        if (!mode && !users.length) {
            console.log('');
            console.log('No users found!');
            console.log('Create a new user with \'karen add <name>\'.');
            console.log('');
        } else {
            karen({
                host: program.host || process.env.IP || config.host,
                port: program.port || process.env.PORT || config.port,
                bind: program.bind || config.bind,
                public: mode
            });
        }
    });
