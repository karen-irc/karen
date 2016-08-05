// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {ChatCommandDispatcher} from '../dispatcher/ChatCommandDispatcher';
import {ChannelId} from '../../domain/ChannelDomain';
import {CommandType} from '../../domain/CommandType';
import {NetworkId} from '../../domain/NetworkDomain';
import {User} from '../../domain/User';

export class MessageActionCreator {

    private _dispatcher: ChatCommandDispatcher;

    constructor() {
        this._dispatcher = new ChatCommandDispatcher();
    }

    dispatcher(): ChatCommandDispatcher {
        return this._dispatcher;
    }

    inputCommand(channelId: ChannelId, command: string): void {
        const isClearCommand = (typeof command.startsWith === 'function') ?
            command.startsWith(CommandType.CLEAR) :
            (command.indexOf(CommandType.CLEAR) === 0);

        if (isClearCommand) {
            this.clear(channelId);
            return;
        }

        this._dispatcher.sendCommand.next({
            channelId: channelId,
            text: command,
        });
    }

    clear(channelId: ChannelId): void {
        this._dispatcher.clearMessage.next(channelId);
    }

    setTopic(channelId: ChannelId, topic: string): void {
        this._dispatcher.setTopic.next({
            id: channelId,
            topic: topic,
        });
    }

    setNickname(networkId: NetworkId, nickname: string): void {
        this._dispatcher.setNickname.next({
            id: networkId,
            nickname: nickname,
        });
    }

    updateUserList(channelId: ChannelId, list: Array<User>): void {
        this._dispatcher.updateUserList.next({
            channelId,
            list,
        });
    }

    queryWhoIs(channelId: ChannelId, user: string): void {
        this._dispatcher.queryWhoIs.next({
            channelId,
            user,
        });
    }

    fetchHiddenLog(channelId: ChannelId, length: number): void {
        this._dispatcher.fetchHiddenLog.next({
            channelId,
            length,
        });
    }
}
