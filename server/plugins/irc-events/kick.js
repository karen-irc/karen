import 'core-js/fn/array/find';
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
    irc.on('kick', function(data) {
        const from = data.nick;
        const chan = network.channels.find(function(element){
            return element.name === data.channel;
        });
        const mode = chan.getMode(from);

        if (typeof chan === 'undefined') {
            return;
        }

        if (data.client === irc.me) {
            chan.users = [];
        } else {
            const exclude = chan.users.find(function(element){
                return element.name === data.client;
            });
            chan.users = chan.users.filter(function(element){
                return element !== exclude;
            });
        }

        client.emit('users', {
            chan: chan.id,
            users: chan.users
        });

        let self = false;
        if (data.nick.toLowerCase() === irc.me.toLowerCase()) {
            self = true;
        }

        const msg = new Message(chan, {
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
