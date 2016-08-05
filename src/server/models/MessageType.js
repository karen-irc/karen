// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
/** @enum {string} */
export const MessageType = Object.freeze({
    ACTION: 'action',
    ERROR: 'error',
    JOIN: 'join',
    KICK: 'kick',
    MESSAGE: 'message',
    MODE: 'mode',
    MOTD: 'motd',
    NICK: 'nick',
    NOTICE: 'notice',
    PART: 'part',
    QUIT: 'quit',
    TOGGLE: 'toggle',
    TOPIC: 'topic',
    WHOIS: 'whois'
});
