import 'core-js/fn/array/find';
import User from '../../models/User';

export default function(irc, network) {
    const client = this;
    irc.on('names', function(data) {
        const chan = network.channels.find(function(element){
            return element.name === data.channel;
        });
        if (typeof chan === 'undefined') {
            return;
        }
        chan.users = [];
        data.names.forEach(function(u) {
            chan.users.push(new User(u));
        });
        chan.sortUsers();
        client.emit('users', {
            chan: chan.id,
            users: chan.users
        });
    });
}
