import _ from 'lodash';
import Chan from '../../models/Channel';
import Hostmask from '../../models/Hostmask';
import ChannelType from '../../models/ChannelType';
import Message from '../../models/Message';
import MessageType from '../../models/MessageType';

export default function(irc, network) {
    const client = this;
    irc.on('message', function(data) {
        if (data.message.indexOf('\u0001') === 0 && data.message.substring(0, 7) !== '\u0001ACTION') {
            // Hide ctcp messages.
            return;
        }

        let target = data.to;
        if (target.toLowerCase() === irc.me.toLowerCase()) {
            target = data.from;
        }

        let chan = _.findWhere(network.channels, {name: target});
        if (typeof chan === 'undefined') {
            chan = new Chan({
                type: ChannelType.QUERY,
                name: data.from
            });
            network.channels.push(chan);
            client.emit('join', {
                network: network.id,
                chan: chan
            });
        }

        let type = '';
        let text = data.message;
        if (text.split(' ')[0] === '\u0001ACTION') {
            type = MessageType.ACTION;
            text = text.replace(/^\u0001ACTION|\u0001$/g, '');
        }

        text.split(' ').forEach(function(w) {
            if (w.replace(/^@/, '').toLowerCase().indexOf(irc.me.toLowerCase()) === 0) {
                type += ' highlight';
            }
        });

        let self = false;
        if (data.from.toLowerCase() === irc.me.toLowerCase()) {
            self = true;
        }

        if (chan.id !== client.activeChannel) {
            chan.unread++;
        }

        const name = data.from;
        const msg = new Message({
            type: type || MessageType.MESSAGE,
            mode: chan.getMode(name),
            from: name,
            text: text,
            hostmask: new Hostmask(data.hostmask),
            self: self
        });
        chan.messages.push(msg);
        client.emit('msg', {
            chan: chan.id,
            msg: msg
        });
    });
}
