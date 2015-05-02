import _ from 'lodash';
import Chan from '../../models/Channel';
import ChannelType from '../../models/ChannelType';
import Msg from '../../models/Message';
import MessageType from '../../models/MessageType';

export default function(irc, network) {
    var client = this;
    irc.on('whois', function(err, data) {
        if (!!err) {
            throw err;
        }

        if (data === null) {
            return;
        }
        var chan = _.findWhere(network.channels, {name: data.nickname});
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
        var prefix = {
            hostname: 'from',
            realname: 'is',
            channels: 'on',
            server: 'using'
        };
        var i = 0;
        for (var k in data) {
            var key = prefix[k];
            if (!key || data[k].toString() === '') {
                continue;
            }
            var msg = new Msg({
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
