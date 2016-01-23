/*eslint-disable consistent-this,no-param-reassign */

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
    if (cmd !== 'part' && cmd !== 'leave' && cmd !== 'close') {
        return;
    }

    if (chan.type === 'query') {
        const client = this;
        network.channels = network.channels.filter(function(element){
            return element !== chan;
        });
        client.emit('part', {
            chan: chan.id
        });
    } else {
        const irc = network.irc;
        if (args.length === 0) {
            args.push(chan.name);
        }
        irc.part(args);
    }
}
