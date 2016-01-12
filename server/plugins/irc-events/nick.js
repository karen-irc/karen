/*eslint-disable consistent-this */

import Message from '../../models/Message';
import MessageType from '../../models/MessageType';

/**
 *  @this   Client
 *
 *  @param  {?} irc
 *  @param  {Network} network
 *
 *  @return {void}
 */
export default function(irc, network) {
    const client = this;
    irc.on('nick', function(data) {
        let self = false;
        const nick = data.new;
        if (nick === irc.me) {
            const lobby = network.channels[0];
            const msg = new Message(lobby, {
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
            const user = chan.users.find(function(element){
                return element.name === data.nick;
            });
            if (typeof user === 'undefined') {
                return;
            }
            user.name = nick;
            chan.sortUsers();
            client.emit('users', {
                chan: chan.id,
                users: chan.users
            });
            const msg = new Message(chan, {
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
