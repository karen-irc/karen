'use strict';

var Msg = require('../../models/Message');
var MessageType = require('../../models/MessageType');

module.exports = function(network, chan, cmd, args) {
    if (cmd !== 'slap' && cmd !== 'me') {
        return;
    }

    var client = this;
    var irc = network.irc;

    switch (cmd) {
        /*eslint-disable no-fallthrough */
        case 'slap':
            var slap = 'slaps ' + args[0] + ' around a bit with a large trout';
            /* XXX: fall through */
        /*eslint-enable */

        case 'me':
            if (args.length === 0) {
                break;
            }

            var text = slap || args.join(' ');
            irc.action(
                chan.name,
                text
            );

            var msg = new Msg({
                type: MessageType.ACTION,
                from: irc.me,
                text: text
            });
            chan.messages.push(msg);
            client.emit('msg', {
                chan: chan.id,
                msg: msg
            });
            break;
    }
};
