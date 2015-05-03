import path from 'path';

const HOME = (process.env.HOME || process.env.USERPROFILE) + '/.karen';

function getConfig() {
    const file = path.resolve(HOME, './config');
    return module.require(file);
}

export default {
    HOME,
    getConfig
};
