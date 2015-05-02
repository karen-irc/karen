export default function(network, chan, cmd, args) {
    if (cmd !== 'topic') {
        return;
    }

    let msg = 'TOPIC';
    msg += ' ' + chan.name;
    msg += args[0] ? ' :' + args.join(' ') : '';

    const irc = network.irc;
    irc.write(msg);
}
