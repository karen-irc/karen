import 'core-js/fn/array/find';
import Channel from '../../models/Channel';
import ChannelType from '../../models/ChannelType';
import Message from '../../models/Message';
import MessageType from '../../models/MessageType';

export default function(irc, network) {
    const client = this;
    irc.on('whois', function(err, data) {
        if (!!err) {
            return;
        }

        if (data === null) {
            return;
        }

        let chan = network.channels.find(function(element){
            return element.name === data.nickname;
        });
        if (typeof chan === 'undefined') {
            chan = new Channel(network, {
                type: ChannelType.QUERY,
                name: data.nickname
            });
            network.channels.push(chan);
            client.emit('join', {
                network: network.id,
                chan: chan
            });
        }

        const prefix = {
            hostname: 'from',
            realname: 'is',
            channels: 'on',
            server: 'using'
        };

        for (const k in data) {
            const key = prefix[k];
            if (!key || data[k].toString() === '') {
                continue;
            }

            const msg = new Message(chan, {
                type: MessageType.WHOIS,
                from: data.nickname,
                text: key + ' ' + data[k]
            });
            chan.messages.push(msg);
            client.emit('msg', {
                chan: chan.id,
                msg: msg
            });
        }
    });
}
