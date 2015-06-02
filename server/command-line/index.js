import path from 'path';
import program from 'commander';
import fs from 'fs';
import mkdirp from 'mkdirp';
import ConfigDriver from '../adapter/ConfigDriver';
import Package from '../adapter/Package';

const pkg = Package.getPackage();
program.version(pkg.version, '-v, --version');
program.option('');
program.option('    --home <path>', 'home path');

import './start';
import './config';
import './list';
import './add';
import './remove';
import './reset';
import './edit';

var argv = program.parseOptions(process.argv);
if (program.home) {
    ConfigDriver.setHome(program.home);
}

var config = path.join(ConfigDriver.getHome(), 'config.js');
if (!fs.existsSync(config)) {
    mkdirp.sync(ConfigDriver.getHome());
    fs.writeFileSync(
        config,
        fs.readFileSync(path.resolve(Package.getRoot(), './defaults/config.js'))
    );
    console.log('Config created:');
    console.log(config);
}

program.parse(argv.args);

if (!program.args.length) {
    program.parse(process.argv.concat('start'));
}
