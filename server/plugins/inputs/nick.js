export default function(network, chan, cmd, args) {
    if (cmd !== 'nick') {
        return;
    }
    if (args.length !== 0) {
        const irc = network.irc;
        irc.nick(args[0]);
    }
}
