/// <reference path='../../../typings/index.d.ts'/>

import * as os from 'os';
import * as path from 'path';

/**
 *  @param  {NodeJS.Process.env}    env
 *  @returns    {string}
 */
function getXdgHome(env) {
    const xdg = env.XDG_CONFIG_HOME;
    let home = '';
    if (xdg === undefined || xdg === null || typeof xdg !== 'string' || xdg === '') {
        home = path.resolve(os.homedir(), '.config');
    }
    else {
        home = xdg;
    }

    return home;
}

class ConfigDriver {
    constructor() {
        const config = getXdgHome(process.env);
        const home = path.resolve(config, './karen');

        this._home = home;
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

export default new ConfigDriver();
