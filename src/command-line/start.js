/*eslint quotes: [2, "single"]*/
'use strict';

var _ = require('lodash');
var ClientManager = require('../clientManager');
var program = require('commander');
var karen = require('../server');
var Helper = require('../helper');

program
    .option('-H, --host <ip>', 'host')
    .option('-P, --port <port>', 'port')
    .option('-B, --bind <ip>', 'bind')
    .option('    --public', 'mode')
    .option('    --private', 'mode')
    .command('start')
    .description('Start the server')
    .action(function() {
        var users = new ClientManager().getUsers();
        var config = Helper.getConfig();
        var mode = config.public;
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
