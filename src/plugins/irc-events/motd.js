import Message from '../../models/Message';
import MessageType from '../../models/MessageType';

export default function(irc, network) {
    const client = this;
    irc.on('motd', function(data) {
        const lobby = network.channels[0];
        data.motd.forEach(function(text) {
            const msg = new Message({
                type: MessageType.MOTD,
                text: text
            });
            lobby.messages.push(msg);
            client.emit('msg', {
                chan: lobby.id,
                msg: msg
            });
        });
    });
}
