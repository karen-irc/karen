import 'core-js/fn/array/find';

export default function(network, chan, cmd, args) {
    if (cmd !== 'ns' && cmd !== 'cs' && cmd !== 'hs') {
        return;
    }

    const target = ({
        ns: 'nickserv',
        cs: 'chanserv',
        hs: 'hostserv' })[cmd];
    if (!target || args.length === 0 || args[0] === '') {
        return;
    }

    const irc = network.irc;
    const msg = args.join(' ');
    irc.send(target, msg);

    const channel = network.channels.find(function(element){
        return element.name === target;
    });
    if (typeof channel !== 'undefined') {
        irc.emit('message', {
            from: irc.me,
            to: channel.name,
            message: msg
        });
    }
}
