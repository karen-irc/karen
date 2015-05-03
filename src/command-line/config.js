import fs from 'fs';
import path from 'path';
import program from 'commander';
import mkdirp from 'mkdirp';
import child from 'child_process';
import ConfigDriver from '../adopter/ConfigDriver';

program
    .command('config')
    .description('Edit config: \'' + ConfigDriver.HOME + '/config.js\'')
    .action(function() {
        child.spawn(
            process.env.EDITOR || 'vi',
            [ConfigDriver.HOME + '/config.js'],
            {stdio: 'inherit'}
        );
    });
