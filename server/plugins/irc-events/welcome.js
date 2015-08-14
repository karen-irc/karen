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
    irc.on('welcome', function(data) {
        network.connected = true;
        irc.write('PING ' + network.host);

        const lobby = network.channels[0];
        const nick = data;
        const msg = new Message(lobby, {
            text: 'You\'re now known as ' + nick
        });

        lobby.messages.push(msg);
        client.emit('msg', {
            chan: lobby.id,
            msg: msg
        });

        client.save();
        client.emit('nick', {
            network: network.id,
            nick: nick
        });
    });
}
