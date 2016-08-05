// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
/** @enum {string}  */
export const CommandType = Object.freeze({
    CLEAR: '/clear',
    CLOSE: '/close',
    CONNECT: '/connect',
    DEOP: '/deop',
    DEVOICE: '/devoice',
    DISCONNECT: '/disconnect',
    INVITE: '/invite',
    JOIN: '/join',
    KICK: '/kick',
    LEAVE: '/leave',
    MODE: '/mode',
    MSG: '/msg',
    NICK: '/nick',
    NOTICE: '/notice',
    OP: '/op',
    PART: '/part',
    QUERY: '/query',
    QUIT: '/quit',
    RAW: '/raw',
    SAY: '/say',
    SEND: '/send',
    SERVER: '/server',
    SLAP: '/slap',
    TOPIC: '/topic',
    VOICE: '/voice',
    WHOIS: '/whois',
});

export const CommandList: Array<string> = Object.keys(CommandType).map(function(name: string): string {
    return (CommandType as any)[name]; // tslint:disable-line:no-any
});
Object.freeze(CommandList);
