export default function(network, chan, cmd, args) {
    if (cmd !== 'notice' || !args[1]) {
        return;
    }
    const irc = network.irc;
    irc.notice(args[0], args.slice(1).join(' '));
}
