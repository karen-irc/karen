import fs from 'fs';
import path from 'path';
import program from 'commander';
import mkdirp from 'mkdirp';
import child from 'child_process';
import Helper from '../helper';

program
    .command('config')
    .description('Edit config: \'' + Helper.HOME + '/config.js\'')
    .action(function() {
        child.spawn(
            process.env.EDITOR || 'vi',
            [Helper.HOME + '/config.js'],
            {stdio: 'inherit'}
        );
    });
