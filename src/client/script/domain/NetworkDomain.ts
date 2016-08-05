// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {Some, None} from 'option-t';
import * as Rx from 'rxjs';

import {ChannelDomain, ChannelId} from './ChannelDomain';
import {RecievedMessage} from './Message';
import {Network} from './Network';

import {MessageGateway} from '../adapter/MessageGateway';

export type NetworkId = number;

export class NetworkDomain {

    private _channels: Map<ChannelId, ChannelDomain>;

    private _data: Network;
    private _nickname: Rx.Observable<string>;
    private _joinedChannel: Rx.Observable<ChannelDomain>;
    private _partedChannel: Rx.Observable<ChannelDomain>;

    private _nickUpdater: Rx.Subject<{ networkId: NetworkId; nick: string; }>;
    private _joinedUpdater: Rx.Subject<ChannelDomain>;
    private _partedUpdater: Rx.Subject<ChannelDomain>;
    private _notableMsgDispatcher: Rx.Subject<RecievedMessage>;
    private _notifiableMsgDispatcher: Rx.Subject<RecievedMessage>;

    private _subscribed: Rx.Subscription;

    constructor(gateway: MessageGateway,
                data: Network,
                nicknameUpdater: Rx.Subject<{ networkId: NetworkId; nick: string; }>,
                joinedUpdater: Rx.Subject<ChannelDomain>,
                partedUpdater: Rx.Subject<ChannelDomain>,
                notableMsgDispatcher: Rx.Subject<RecievedMessage>,
                notifiableMsgDispatcher: Rx.Subject<RecievedMessage>) {

        this._channels = new Map();
        for (const channel of data.getChannelList()) {
            const domain = new ChannelDomain(gateway,
                                             channel,
                                             notableMsgDispatcher,
                                             notifiableMsgDispatcher);
            this._channels.set(domain.getId(), domain);
        }

        this._data = data;
        this._nickUpdater = nicknameUpdater;
        this._joinedUpdater = joinedUpdater;
        this._partedUpdater = partedUpdater;
        this._notableMsgDispatcher = notableMsgDispatcher;
        this._notifiableMsgDispatcher = notifiableMsgDispatcher;

        this._nickname = gateway.setNickname().filter((data) => {
            return data.networkId === this._data.id;
        }).map(function(data){
            return data.nickname;
        }).do((nick) => {
            this._data.changeNickName(nick);
        }).share();

        this._joinedChannel = gateway.joinChannel().filter((data) => {
            return data.networkId === this._data.id;
        }).map((data) => {
            const channel = data.channel;
            const domain = new ChannelDomain(gateway,
                                             channel,
                                             this._notableMsgDispatcher,
                                             this._notifiableMsgDispatcher);
            return domain;
        }).do((channel) => {
            this._channels.set(channel.getId(), channel);
            this._data.addChannel(channel.getValue());
        }).share();

        this._partedChannel = gateway.partFromChannel().map((id) => {
            const channel = this._channels.get(id);
            return (channel !== undefined) ? new Some(channel) : new None<ChannelDomain>();
        }).filter(function(channel){
            return channel.isSome;
        }).map(function (channel) {
            return channel.expect('this should be unwrapped safely');
        }).do((channel) => {
            this._channels.delete(channel.getId());
            this._data.removeChannel(channel.getValue());
            channel.dispose();
        }).share();

        this._subscribed = new Rx.Subscription();
        this._subscribed.add(this._nickname.subscribe((nickname: string) => {
            this._nickUpdater.next({
                networkId: this._data.id,
                nick: nickname,
            });
        }));
        this._subscribed.add(this._joinedChannel.subscribe((channel) => {
            this._joinedUpdater.next(channel);
        }));
        this._subscribed.add(this._partedChannel.subscribe((channel) => {
            this._partedUpdater.next(channel);
        }));
    }

    dispose(): void {
        this._subscribed.unsubscribe();
    }

    getId(): number {
        return this._data.id;
    }

    getValue(): Network {
        return this._data;
    }

    getChannelDomainList(): Array<ChannelDomain> {
        const buffer: Array<ChannelDomain> = Array.from(this._channels.values());
        return buffer;
    }

    updatedNickname(): Rx.Observable<string> {
        return this._nickname;
    }

    joinedChannel(): Rx.Observable<ChannelDomain> {
        return this._joinedChannel;
    }

    partedChannel(): Rx.Observable<ChannelDomain> {
        return this._partedChannel;
    }
}
