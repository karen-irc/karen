import _ from 'lodash';
import Message from '../../models/Message';
import MessageType from '../../models/MessageType';

export default function(irc, network) {
    const client = this;
    irc.on('mode', function(data) {
        const chan = _.findWhere(network.channels, {name: data.target});
        if (typeof chan !== 'undefined') {
            setTimeout(function() {
                irc.write('NAMES ' + data.target);
            }, 200);

            let from = data.nick;
            if (from.indexOf('.') !== -1) {
                from = data.target;
            }

            let self = false;
            if (from.toLowerCase() === irc.me.toLowerCase()) {
                self = true;
            }

            const msg = new Message({
                type: MessageType.MODE,
                mode: chan.getMode(from),
                from: from,
                text: data.mode + ' ' + data.client,
                self: self
            });
            chan.messages.push(msg);
            client.emit('msg', {
                chan: chan.id,
                msg: msg,
            });
        }
    });
}
