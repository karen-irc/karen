import 'core-js/fn/array/find';

/**
 *  @this   Client
 *
 *  @param  {Network}   network
 *  @param  {Channel}   chan
 *  @param  {string}    cmd
 *  @param  {Array<string>} args
 *
 *  @return {void}
 */
export default function(network, chan, cmd, args) {
    if (cmd !== 'say' && cmd !== 'msg') {
        return;
    }
    if (args.length === 0 || args[0] === '') {
        return;
    }
    const client = this;
    const irc = network.irc;
    let target = '';
    if (cmd === 'msg') {
        target = args.shift();
        if (args.length === 0) {
            return;
        }
    } else {
        target = chan.name;
    }
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
