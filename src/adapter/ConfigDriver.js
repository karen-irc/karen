import path from 'path';

class ConfigDriver {
    constructor(defaultHome) {
        this._home = defaultHome;
    }

    getConfig() {
        const file = path.resolve(path.join(this.getHome(), 'config'));
        return module.require(file);
    }

    getHome() {
        return this._home;
    }

    setHome(home) {
        this._home = home;
    }
}

const HOME = (process.env.HOME || process.env.USERPROFILE) + '/.karen';

export default new ConfigDriver(HOME);
