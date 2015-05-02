export default function(network, chan, cmd, args) {
    if (cmd !== 'whois' && cmd !== 'query') {
        return;
    }
    if (args.length !== 0) {
        const irc = network.irc;
        irc.whois(args[0]);
    }
}
