import Message from '../../models/Message';
import MessageType from '../../models/MessageType';

export default function(irc, network) {
    const client = this;
    irc.on('errors', function(data) {
        const lobby = network.channels[0];
        const msg = new Message(lobby, {
            type: MessageType.ERROR,
            text: data.message,
        });
        client.emit('msg', {
            chan: lobby.id,
            msg: msg
        });

        if (!network.connected) {
            if (data.cmd === 'ERR_NICKNAMEINUSE') {
                const random = irc.me + Math.floor(10 + (Math.random() * 89));
                irc.nick(random);
            }
        }
    });
}
