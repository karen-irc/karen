import _ from 'lodash';

export default function(network, chan, cmd, args) {
    if (cmd !== 'part' && cmd !== 'leave' && cmd !== 'close') {
        return;
    }

    if (chan.type === 'query') {
        const client = this;
        network.channels = _.without(network.channels, chan);
        client.emit('part', {
            chan: chan.id
        });
    } else {
        const irc = network.irc;
        if (args.length === 0) {
            args.push(chan.name);
        }
        irc.part(args);
    }
}
