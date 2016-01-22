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
    irc.on('notice', function(data) {
        let target = data.to;
        if (target.toLowerCase() === irc.me.toLowerCase()) {
            target = data.from;
        }

        let chan = network.channels.find(function(element){
            return element.name === target;
        });
        if (typeof chan === 'undefined') {
            chan = network.channels[0];
        }

        let from = data.from || '';
        if (data.to === '*' || data.from.indexOf('.') !== -1) {
            from = '';
        }

        const msg = new Message(chan, {
            type: MessageType.NOTICE,
            from: from,
            text: data.message
        });
        chan.messages.push(msg);
        client.emit('msg', {
            chan: chan.id,
            msg: msg
        });
    });
}
