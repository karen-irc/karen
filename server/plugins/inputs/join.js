export default function(network, chan, cmd, args) {
    if (cmd !== 'join') {
        return;
    }
    if (args.length !== 0) {
        const irc = network.irc;
        irc.join(args[0], args[1]);
    }
}
