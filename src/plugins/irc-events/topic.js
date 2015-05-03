import _ from 'lodash';
import Msg from '../../models/Message';
import MessageType from '../../models/MessageType';

export default function(irc, network) {
    const client = this;
    irc.on('topic', function(data) {
        const chan = _.findWhere(network.channels, {name: data.channel});
        if (typeof chan === 'undefined') {
            return;
        }

        const from = data.nick || chan.name;
        let self = false;
        if (from.toLowerCase() === irc.me.toLowerCase()) {
            self = true;
        }

        const topic = data.topic;
        const msg = new Msg({
            type: MessageType.TOPIC,
            mode: chan.getMode(from),
            from: from,
            text: topic,
            self: self
        });

        chan.messages.push(msg);
        client.emit('msg', {
            chan: chan.id,
            msg: msg
        });

        chan.topic = topic;

        client.emit('topic', {
            chan: chan.id,
            topic: chan.topic
        });
    });
}
