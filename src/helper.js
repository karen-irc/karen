/*eslint quotes: [2, "single"]*/
'use strict';

var path = require('path');

module.exports = {
    HOME: (process.env.HOME || process.env.USERPROFILE) + '/.karen',
    getConfig: getConfig,
};

function getConfig() {
    return require(path.resolve(this.HOME) + '/config');
}
