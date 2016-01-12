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
    irc.on('part', function(data) {
        const chan = network.channels.find(function(element){
            return element.name === data.channels[0];
        });
        if (typeof chan === 'undefined') {
            return;
        }

        const from = data.nick;
        if (from === irc.me) {
            network.channels = network.channels.filter(function(element){
                return element !== chan;
            });
            client.save();
            client.emit('part', {
                chan: chan.id
            });
        }
        else {
            const user = chan.users.find(function(element){
                return element.name === from;
            });
            chan.users = chan.users.filter(function(element){
                return element !== user;
            });
            client.emit('users', {
                chan: chan.id,
                users: chan.users
            });

            const msg = new Message(chan, {
                type: MessageType.PART,
                mode: chan.getMode(from),
                from: from
            });
            chan.messages.push(msg);
            client.emit('msg', {
                chan: chan.id,
                msg: msg
            });
        }
    });
}
