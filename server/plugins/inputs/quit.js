export default function(network, chan, cmd, args) {
    if (cmd !== 'quit' && cmd !== 'disconnect') {
        return;
    }

    const client = this;

    client.networks = client.networks.filter(function(element){
        return element !== network;
    });
    client.save();
    client.emit('quit', {
        network: network.id
    });

    const irc = network.irc;
    const quitMessage = args[0] ? args.join(' ') : '';
    irc.quit(quitMessage);
}
