import _ from 'lodash';
import Chan from '../../models/Channel';
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

        let chan = _.findWhere(network.channels, {name: data.nickname});
        if (typeof chan === 'undefined') {
            chan = new Chan({
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

            const msg = new Message({
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
