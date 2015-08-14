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
    if (cmd !== 'connect' && cmd !== 'server') {
        return;
    }
    if (args.length !== 0) {
        const client = this;
        client.connect({
            host: args[0],
        });
    }
}
