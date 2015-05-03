import _ from 'lodash';
import Chan from '../../models/Channel';
import Message from '../../models/Message';
import MessageType from '../../models/MessageType';
import User from '../../models/User';

export default function(irc, network) {
    const client = this;
    irc.on('join', function(data) {
        let chan = _.find(network.channels, {name: data.channel});
        if (typeof chan === 'undefined') {
            chan = new Chan({
                name: data.channel
            });
            network.channels.push(chan);
            client.save();
            client.emit('join', {
                network: network.id,
                chan: chan
            });
        }

        const users = chan.users;
        users.push(new User({name: data.nick}));
        chan.sortUsers();
        client.emit('users', {
            chan: chan.id,
            users: users
        });

        let self = false;
        if (data.nick.toLowerCase() === irc.me.toLowerCase()) {
            self = true;
        }
        const msg = new Message({
            from: data.nick,
            type: MessageType.JOIN,
            self: self
        });
        chan.messages.push(msg);
        client.emit('msg', {
            chan: chan.id,
            msg: msg
        });
    });
}
