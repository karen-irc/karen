// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {ChannelId} from './ChannelDomain';

export interface Message {
    id: number;
    mode: string;
    type: string;
    from: string;
    time: string;
    text: string;
    toggle: boolean;
    self: boolean;
    userImage?: string;
}

export interface RecievedMessage {
    channelId: ChannelId;
    message: Message;
}
