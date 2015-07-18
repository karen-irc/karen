import 'core-js/fn/array/find';
import Message from '../../models/Message';
import MessageType from '../../models/MessageType';

export default function(irc, network) {
    const client = this;
    irc.on('quit', function(data) {
        network.channels.forEach(function(chan) {
            const from = data.nick;
            const user = chan.users.find(function(element){
                return element.name === from;
            });
            if (typeof user === 'undefined') {
                return;
            }

            chan.users = chan.users.filter(function(element){
                return element !== user;
            });
            client.emit('users', {
                chan: chan.id,
                users: chan.users
            });

            const msg = new Message(chan, {
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
