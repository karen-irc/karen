import Message from '../../models/Message';
import MessageType from '../../models/MessageType';

/**
 *  @this   Client
 *
 *  @param  {Network}   network
 *  @param  {Channel}   chan
 *  @param  {string}    cmd
 *  @param  {Array<string>} args
 *
 *  @return {void}
 */
export default function(network, chan, cmd, args) {
    if (cmd !== 'slap' && cmd !== 'me') {
        return;
    }

    let slap = '';
    switch (cmd) {
        /*eslint-disable no-fallthrough */
        case 'slap':
            slap = 'slaps ' + args[0] + ' around a bit with a large trout';
        /* XXX: fall through */
        /*eslint-enable */

        /* eslint-disable indent */
        case 'me': {
        /* eslint-enable */
            const client = this;
            const irc = network.irc;
            if (args.length === 0) {
                break;
            }

            const text = slap || args.join(' ');
            irc.action(chan.name, text);

            const msg = new Message(chan, {
                type: MessageType.ACTION,
                from: irc.me,
                text: text
            });
            chan.messages.push(msg);
            client.emit('msg', {
                chan: chan.id,
                msg: msg
            });

            break;
        }
    }
}
