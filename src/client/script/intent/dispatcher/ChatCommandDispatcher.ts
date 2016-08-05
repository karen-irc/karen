// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as Rx from 'rxjs';

import {ChannelId} from '../../domain/ChannelDomain';
import {NetworkId} from '../../domain/NetworkDomain';
import {User} from '../../domain/User';

type Command = {
    channelId: ChannelId;
    text: string;
};

type Topic = {
    id: ChannelId;
    topic: string;
};

export class ChatCommandDispatcher {

    sendCommand: Rx.Subject<Command>;
    clearMessage: Rx.Subject<ChannelId>;
    setTopic: Rx.Subject<Topic>;
    setNickname: Rx.Subject<{ id: NetworkId, nickname: string }>;
    updateUserList: Rx.Subject<{ channelId: ChannelId, list: Array<User> }>;
    queryWhoIs: Rx.Subject<{ channelId: ChannelId; user: string; }>;
    fetchHiddenLog: Rx.Subject<{ channelId: ChannelId; length: number; }>;

    constructor() {
        this.sendCommand = new Rx.Subject<Command>();

        this.clearMessage = new Rx.Subject<ChannelId>();

        this.setTopic = new Rx.Subject<Topic>();

        this.setNickname = new Rx.Subject<{ id: NetworkId, nickname: string }>();

        this.updateUserList = new Rx.Subject<{ channelId: ChannelId, list: Array<User> }>();

        this.queryWhoIs = new Rx.Subject<{ channelId: ChannelId; user: string; }>();
        this.fetchHiddenLog = new Rx.Subject<{ channelId: ChannelId; length: number; }>();
    }
}
