// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
'use strict';

const os = require('os');

function getSuffixedCommandName(command) {
    const suffix = (os.platform() === 'win32') ? '.cmd' : '';
    const name = command + suffix;
    return name;
}

module.exports = Object.freeze({
    getSuffixedCommandName,
});
