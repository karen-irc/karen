// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import action from './action';
import connect from './connect';
import invite from './invite';
import join from './join';
import kick from './kick';
import mode from './mode';
import msg from './msg';
import nick from './nick';
import notice from './notice';
import part from './part';
import quit from './quit';
import raw from './raw';
import services from './services';
import topic from './topic';
import whois from './whois';

export const inputPluginList = [
    action,
    connect,
    invite,
    join,
    kick,
    mode,
    msg,
    nick,
    notice,
    part,
    quit,
    raw,
    services,
    topic,
    whois,
];
