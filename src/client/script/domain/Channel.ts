// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {ChannelId} from './ChannelDomain';
import {Message} from './Message';
import {Network} from './Network';
import {User} from './User';

export class Channel {
    id: ChannelId;
    name: string;
    topic: string;
    type: string;
    private _userList: Array<User>;
    private _unread: number;
    private _messageBuffer: Array<Message>;
    private _network: Network | void;

    constructor(raw: any, network: Network | void = undefined) { // tslint:disable-line:no-any
        this.id = raw.id;

        this.name = raw.name;

        this.topic = raw.topic;

        this.type = raw.type;

        const userList: Array<User> = raw.users.map(function(item: any) { // tslint:disable-line:no-any
            const user = new User(item);
            return user;
        });
        this._userList = userList;

        this._unread = raw.unread;

        let messages: Array<Message> = [];
        if (Array.isArray(raw.messages)) {
            messages = raw.messages;
        }

        this._messageBuffer = messages;
        this._network = network;
    }

    unread(): number {
        return this._unread;
    }

    messages(): Array<Message> {
        return this._messageBuffer;
    }

    userList(): Array<User> {
        return this._userList;
    }

    getNetwork(): Network | void {
        return this._network;
    }

    bindToNetwork(network: Network): void {
        this._network = network;
    }

    updateTopic(topic: string): void {
        this.topic = topic;
    }

    updateUserList(list: Array<User>): void {
        this._userList = list;
    }
}
