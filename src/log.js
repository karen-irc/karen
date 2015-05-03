import fs from 'fs';
import mkdirp from 'mkdirp';
import moment from 'moment';
import ConfigDriver from './adopter/ConfigDriver';

function write(user, network, chan, msg) {
    var path = ConfigDriver.HOME + '/logs/' + user + '/' + network;
    try {
        mkdirp.sync(path);
    } catch(e) {
        console.log(e);
        return;
    }

    var config = ConfigDriver.getConfig();
    var format = (config.logs || {}).format || 'YYYY-MM-DD HH:mm:ss';
    var tz = (config.logs || {}).timezone || 'UTC+00:00';

    var time = moment().zone(tz).format(format);
    var line = '[' + time + '] ';

    var type = msg.type.trim();
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
        path + '/' + chan + '.log',
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
