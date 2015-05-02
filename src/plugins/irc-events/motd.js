'use strict';

var Msg = require('../../models/Message');
var MessageType = require('../../models/MessageType');

module.exports = function(irc, network) {
    var client = this;
    irc.on('motd', function(data) {
        var lobby = network.channels[0];
        data.motd.forEach(function(text) {
            var msg = new Msg({
                type: MessageType.MOTD,
                text: text
            });
            lobby.messages.push(msg);
            client.emit('msg', {
                chan: lobby.id,
                msg: msg
            });
        });
    });
};
