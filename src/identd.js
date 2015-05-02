import _ from 'lodash';
import net from 'net';

var users = {};

function parse(data) {
    var str = data.toString();
    str = str.split(',');
    return parseInt(str[0], 10) + ', ' + parseInt(str[1], 10);
}

function respond(socket, data) {
    var id = parse(data);
    var response = id + ' : ';
    if (users[id]) {
        response += 'USERID : UNIX : ' + users[id];
    } else {
        response += 'ERROR : NO-USER';
    }
    response += '\r\n';
    socket.write(response);
    socket.end();
}

function init(socket) {
    socket.on('data', function(data) {
        respond(socket, data);
    });
}

function start(port) {
    var server = net.createServer(init).listen(port || 113);
}

function hook(stream, user) {
    var id = '';
    var socket = stream.socket || stream;
    socket.on('connect', function() {
        var ports = _.pick(socket, 'localPort', 'remotePort');
        id = _.values(ports).join(', ');
        users[id] = user;
    });
    socket.on('close', function() {
        delete users[id];
    });
}

export default {
    start,
    hook
};
