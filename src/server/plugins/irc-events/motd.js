/*eslint-disable consistent-this */

import {Message} from '../../models/Message';
import {MessageType} from '../../models/MessageType';

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
    irc.on('motd', function(data) {
        const lobby = network.channels[0];
        data.motd.forEach(function(text) {
            const msg = new Message(lobby, {
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
