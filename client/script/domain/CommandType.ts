/**
 * @license MIT License
 *
 * Copyright (c) 2015 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

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
    return CommandType[name];
});
Object.freeze(CommandList);