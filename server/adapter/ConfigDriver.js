import os from 'os';
import path from 'path';

const HOME = path.resolve(os.homedir(), './.karen');

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

export default new ConfigDriver(HOME);
