// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
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
        this.canConnect = canConnect;

        Object.seal(this);
    }

    toJSON(): any { // tslint:disable-line:no-any
        return {
            name: this.network.name,
            host: this.network.url,
            passward: this.network.port,
            port: this.network.port,
            tls: this.network.useTLS,
            nick: this.personal.nickname,
            username: this.personal.username,
            realname: this.personal.realname,
            join: this.personal.channel,
        };
    }
}


