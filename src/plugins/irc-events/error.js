import Msg from '../../models/Message';
import MessageType from '../../models/MessageType';

export default function(irc, network) {
    var client = this;
    irc.on('errors', function(data) {
        var lobby = network.channels[0];
        var msg = new Msg({
            type: MessageType.ERROR,
            text: data.message,
        });
        client.emit('msg', {
            chan: lobby.id,
            msg: msg
        });
        if (!network.connected) {
            if (data.cmd === 'ERR_NICKNAMEINUSE') {
                var random = irc.me + Math.floor(10 + (Math.random() * 89));
                irc.nick(random);
            }
        }
    });
}
