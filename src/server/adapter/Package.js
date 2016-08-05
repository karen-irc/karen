// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import fs from 'fs';
import path from 'path';

// NOTE:
//  * Take care the path to the root. This Package.js will be locate at
//    dist/server/adapter/Package.js. So '../../..' is required.
//  * We can wait the synchronous call in the start up time.
/*eslint-disable no-sync*/
const root = path.join(path.dirname(fs.realpathSync(__filename)), '../../..');
/*eslint-enable */

class Package {
    constructor(packageObject) {
        this._package = packageObject;
    }

    getPackage() {
        return this._package;
    }

    getRoot() {
        return root;
    }
}

/*eslint-disable global-require */
// XXX: load config file as JS object.
const config = require(path.join(root, 'package.json'));
/*eslint-enable */
export default new Package(config);
