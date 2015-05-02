import _ from 'lodash';
import Msg from '../../models/Message';
import MessageType from '../../models/MessageType';

export default function(irc, network) {
    const client = this;
    irc.on('quit', function(data) {
        network.channels.forEach(function(chan) {
            const from = data.nick;
            const user = _.findWhere(chan.users, {
                name: from,
            });
            if (typeof user === 'undefined') {
                return;
            }

            chan.users = _.without(chan.users, user);
            client.emit('users', {
                chan: chan.id,
                users: chan.users
            });

            const msg = new Msg({
                type: MessageType.QUIT,
                mode: chan.getMode(from),
                from: from
            });
            chan.messages.push(msg);
            client.emit('msg', {
                chan: chan.id,
                msg: msg
            });
        });
    });
}
