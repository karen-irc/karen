import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import moment from 'moment';
import ConfigDriver from './adapter/ConfigDriver';

function write(user, network, chan, msg) {
    const logsPath = path.join(ConfigDriver.getHome(), 'logs', user, network);
    try {
        mkdirp.sync(logsPath);
    } catch (e) {
        console.log(e);
        return;
    }

    const config = ConfigDriver.getConfig();
    const format = (config.logs || {}).format || 'YYYY-MM-DD HH:mm:ss';
    const tz = (config.logs || {}).timezone || 'UTC+00:00';

    const time = moment().zone(tz).format(format);
    let line = '[' + time + '] ';

    const type = msg.type.trim();
    if (type === 'message' || type === 'highlight') {
        // Format:
        // [2014-01-01 00:00:00] <Arnold> Put that cookie down.. Now!!
        line += '<' + msg.from + '> ' + msg.text;
    } else {
        // Format:
        // [2014-01-01 00:00:00] * Arnold quit
        line += '* ' + msg.from + ' ' + msg.type;
        if (msg.text) {
            line += ' ' + msg.text;
        }
    }

    fs.appendFile(
        path.join(logsPath, chan + '.log'),
        line + '\n',
        function(e) {
            if (e) {
                console.log('Log#write():\n' + e);
            }
        }
    );
}

export default {
    write
};
