export default function(network, chan, cmd, args) {
    if (cmd !== 'invite') {
        return;
    }
    if (args.length === 2) {
        const irc = network.irc;
        irc.invite(args[0], args[1]);
    }
}
