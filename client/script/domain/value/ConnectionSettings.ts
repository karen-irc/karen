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

export class NetworkValue {

    name: string;
    url: string;
    port: number;
    pass: string;
    useTLS: boolean;

    constructor(name: string,
                url: string,
                port: number,
                pass: string,
                useTLS: boolean) {
        this.name = name;
        this.url = url;
        this.port = port;
        this.pass = pass;
        this.useTLS = useTLS;
    }
}

export class PersonalValue {

    nickname: string;
    username: string;
    realname: string;
    channel: string;

    constructor(nick: string, user: string, real: string, channel: string) {
        this.nickname = nick;
        this.username = user;
        this.realname = real;
        this.channel = channel;
    }
}

export class ConnectionValue {

    network: NetworkValue;
    personal: PersonalValue;
    canConnect: boolean;

    constructor(network: NetworkValue,
                personal: PersonalValue,
                canConnect: boolean) {
        this.network = network;
        this.personal = personal;
        this.canConnect = canConnect

        Object.seal(this);
    }
}


