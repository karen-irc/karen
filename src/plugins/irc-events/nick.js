import _ from 'lodash';
import Msg from '../../models/Message';
import MessageType from '../../models/MessageType';

export default function(irc, network) {
    const client = this;
    irc.on('nick', function(data) {
        let self = false;
        const nick = data.new;
        if (nick === irc.me) {
            const lobby = network.channels[0];
            const msg = new Msg({
                text: 'You\'re now known as ' + nick,
            });
            lobby.messages.push(msg);
            client.emit('msg', {
                chan: lobby.id,
                msg: msg
            });
            self = true;
            client.save();
            client.emit('nick', {
                network: network.id,
                nick: nick
            });
        }

        network.channels.forEach(function(chan) {
            const user = _.findWhere(chan.users, {name: data.nick});
            if (typeof user === 'undefined') {
                return;
            }
            user.name = nick;
            chan.sortUsers();
            client.emit('users', {
                chan: chan.id,
                users: chan.users
            });
            const msg = new Msg({
                type: MessageType.NICK,
                from: data.nick,
                text: nick,
                self: self
            });
            chan.messages.push(msg);
            client.emit('msg', {
                chan: chan.id,
                msg: msg
            });
        });
    });
}
