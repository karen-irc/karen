import _ from 'lodash';
import Msg from '../../models/Message';
import MessageType from '../../models/MessageType';

export default function(irc, network) {
    const client = this;
    irc.on('kick', function(data) {
        const from = data.nick;
        const chan = _.findWhere(network.channels, {name: data.channel});
        const mode = chan.getMode(from);

        if (typeof chan === 'undefined') {
            return;
        }

        if (data.client === irc.me) {
            chan.users = [];
        } else {
            chan.users = _.without(chan.users, _.findWhere(chan.users, {name: data.client}));
        }

        client.emit('users', {
            chan: chan.id,
            users: chan.users
        });

        let self = false;
        if (data.nick.toLowerCase() === irc.me.toLowerCase()) {
            self = true;
        }

        const msg = new Msg({
            type: MessageType.KICK,
            mode: mode,
            from: from,
            text: data.client,
            self: self
        });
        chan.messages.push(msg);
        client.emit('msg', {
            chan: chan.id,
            msg: msg
        });
    });
}
