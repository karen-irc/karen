import _ from 'lodash';
import Chan from '../../models/Channel';
import Msg from '../../models/Message';
import MessageType from '../../models/MessageType';
import User from '../../models/User';

export default function(irc, network) {
    var client = this;
    irc.on('join', function(data) {
        var chan = _.find(network.channels, {name: data.channel});
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
        var users = chan.users;
        users.push(new User({name: data.nick}));
        chan.sortUsers();
        client.emit('users', {
            chan: chan.id,
            users: users
        });
        var self = false;
        if (data.nick.toLowerCase() === irc.me.toLowerCase()) {
            self = true;
        }
        var msg = new Msg({
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
