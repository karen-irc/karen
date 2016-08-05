// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import ctcp from './ctcp';
import error from './error';
import join from './join';
import kick from './kick';
import link from './link';
import mode from './mode';
import motd from './motd';
import message from './message';
import names from './names';
import nick from './nick';
import notice from './notice';
import part from './part';
import quit from './quit';
import topic from './topic';
import welcome from './welcome';
import whois from './whois';

export const eventPluginList = [
    ctcp,
    error,
    join,
    kick,
    link,
    mode,
    motd,
    message,
    names,
    nick,
    notice,
    part,
    quit,
    topic,
    welcome,
    whois,
];
