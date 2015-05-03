import path from 'path';

const HOME = (process.env.HOME || process.env.USERPROFILE) + '/.karen';

function getConfig() {
    return require(path.resolve(this.HOME) + '/config');
}

export default {
    HOME,
    getConfig
};
