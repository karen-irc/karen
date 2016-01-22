export default function(network, chan, cmd, args) {
    if (cmd !== 'kick') {
        return;
    }
    if (args.length !== 0) {
        const irc = network.irc;
        irc.kick(chan.name, args[0]);
    }
}
