import path from 'path';
import program from 'commander';
import child from 'child_process';
import ConfigDriver from '../adapter/ConfigDriver';

program
    .command('config')
    .description('Edit config: \'' + ConfigDriver.getHome() + '/config.js\'')
    .action(function() {
        child.spawn(
            process.env.EDITOR || 'vi',
            [path.join(ConfigDriver.getHome(), 'config.js')],
            {stdio: 'inherit'}
        );
    });
