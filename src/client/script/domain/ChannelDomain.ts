// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as Rx from 'rxjs';

import {Channel} from './Channel';
import {Message, RecievedMessage} from './Message';
import {User} from './User';

import {MessageGateway} from '../adapter/MessageGateway';

export type ChannelId = number;

const nonNotableMessage: Set<string> = new Set(['join', 'part', 'quit', 'nick', 'mode']);

export class ChannelDomain {

    private _data: Channel;
    private _topic: Rx.Observable<string>;
    private _userList: Rx.Observable<Array<User>>;
    private _message: Rx.Observable<Message>;
    private _notableMessage: Rx.Observable<RecievedMessage>;
    private _notifiableMessage: Rx.Observable<RecievedMessage>;

    private _notableDispatcher: Rx.Subject<RecievedMessage>;
    private _notifiableMsgDispatcher: Rx.Subject<RecievedMessage>;

    private _ignitionDisposable: Rx.Subscription;

    constructor(gateway: MessageGateway,
                data: Channel,
                notableDispatcher: Rx.Subject<RecievedMessage>,
                notifiableMsgDispatcher: Rx.Subject<RecievedMessage>) {
        this._data = data;

        const filterFn = (data: { channelId: ChannelId }) => {
            return data.channelId === this._data.id;
        };

        this._topic = gateway.setTopic().filter(filterFn).map(function(data){
            return data.topic;
        }).do((topic) => {
            this._data.updateTopic(topic);
        }).share();

        this._userList = gateway.updateUserList().filter(filterFn).map(function(data){
            return data.list;
        }).do((list) => {
            this._data.updateUserList(list);
        }).share();

        // TODO: pipe message buffer in `data`
        this._message = gateway.recieveMessage().filter(filterFn).map(function(data){
            return data.message;
        }).share();

        this._notableMessage = this._message.filter(function(message){
            return !nonNotableMessage.has(message.type);
        }).map((msg: Message) => {
            return {
                channelId: this.getId(),
                message: msg,
            };
        }).share();

        this._notifiableMessage = this._message.filter((message: Message) => {
            if (this.getValue().type === 'query') {
                return true;
            }

            if (message.type.indexOf('highlight') !== -1) {
                return true;
            }

            return false;
        }).map((msg: Message) => {
            return {
                channelId: this.getId(),
                message: msg,
            };
        }).share();

        this._notableDispatcher = notableDispatcher;
        this._notifiableMsgDispatcher = notifiableMsgDispatcher;

        this._ignitionDisposable = this._init();
    }

    private _init(): Rx.Subscription {
        const d = new Rx.Subscription();
        d.add(this._topic.subscribe());
        d.add(this._userList.subscribe());
        d.add(this._notableMessage.subscribe((message) => {
            this._notableDispatcher.next(message);
        }));
        d.add(this._notifiableMessage.subscribe((message) => {
            this._notifiableMsgDispatcher.next(message);
        }));
        return d;
    }

    dispose(): void {
        this._ignitionDisposable.unsubscribe();
    }

    getId(): ChannelId {
        return this._data.id;
    }

    getValue(): Channel {
        return this._data;
    }

    updatedTopic(): Rx.Observable<string> {
        return this._topic;
    }

    updatedUserList(): Rx.Observable<Array<User>> {
        return this._userList;
    }

    recievedMessage(): Rx.Observable<Message> {
        return this._message;
    }
}
