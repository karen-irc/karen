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

import {Option, None} from 'option-t';
import * as Rx from 'rxjs';

import {ChannelId} from '../../domain/ChannelDomain';
import {DomainState} from '../../domain/DomainState';
import {RecievedMessage, Message} from '../../domain/Message';
import {Network} from '../../domain/Network';
import {NetworkDomain} from '../../domain/NetworkDomain';

export class SidebarViewState {

    private _list: Array<Network>;
    private _currentId: Option<ChannelId>;
    private _notableChannelSet: Set<ChannelId>;
    private _unreadCountMap: Map<ChannelId, number>;

    constructor(list: Array<Network>,
                currentId: Option<ChannelId>,
                notableChannelSet: Set<ChannelId>,
                unreadCountMap: Map<ChannelId, number>) {
        this._list = list;
        this._currentId = currentId;
        this._notableChannelSet = notableChannelSet;
        this._unreadCountMap = unreadCountMap;
    }

    list(): Array<Network> {
        return this._list;
    }

    currentId(): Option<ChannelId> {
        return this._currentId;
    }

    notableChannelSet(): Set<ChannelId> {
        return this._notableChannelSet;
    }

    unreadCountMap(): Map<ChannelId, number> {
        return this._unreadCountMap;
    }
}

export class SidebarStore {

    private _updater: Rx.Subject<void>;
    private _disposer: Rx.Subscription;

    private _currentId: Option<ChannelId>;
    private _networkSet: Set<Network>;
    private _notableChannelSet: Set<ChannelId>;
    private _unreadCount: Map<ChannelId, number>;

    private _state: Rx.Observable<SidebarViewState>;

    constructor(domain: DomainState) {
        this._updater = new Rx.Subject<void>();

        const disposer = new Rx.Subscription();
        this._disposer = disposer;

        this._currentId = new None<ChannelId>();
        this._networkSet = new Set<Network>();
        this._notableChannelSet = new Set<ChannelId>();
        this._unreadCount = new Map<ChannelId, number>();

        const networkDomain = domain.getNetworkDomain();
        disposer.add(networkDomain.addedNetwork().subscribe((network: NetworkDomain) => {
            const value = network.getValue();
            this._addNetwork(value);
        }));

        disposer.add(networkDomain.removedNetwork().subscribe((network: NetworkDomain) => {
            const value = network.getValue();
            this._removedNetwork(value);
        }));

        disposer.add(networkDomain.joinedChannelAtAll().subscribe((channel) => {
            this._unreadCount.set(channel.getId(), channel.getValue().unread());
            this._updater.next(undefined);
        }));

        disposer.add(networkDomain.partedChannelAtAll().subscribe((channel) => {
            this._unreadCount.delete(channel.getId());
            this._updater.next(undefined);
        }));

        disposer.add(networkDomain.recievedNotableMessage().subscribe((message: RecievedMessage) => {
            this._highlightChannel(message);
        }));

        const currentId: Rx.Observable<Option<ChannelId>> =
            domain.getCurrentTab().map((v) => v.channelId).do((channelId: Option<ChannelId>) => {
                this._currentId = channelId;
                if (channelId.isSome) {
                    const id = channelId.unwrap();
                    this._notableChannelSet.delete(id);
                    this._unreadCount.set(id, 0);
                }
            });

        this._state = currentId.combineLatest<void, SidebarViewState>(this._updater, (selectedId) => {
            const array = Array.from(this._networkSet);
            const state = new SidebarViewState(array,
                                               selectedId,
                                               this._notableChannelSet,
                                               this._unreadCount);
            return state;
        });
    }

    subscribe(observer: Rx.Subscriber<SidebarViewState>): Rx.Subscription {
        return this._state.subscribe(observer);
    }

    dispose(): void {
        this._disposer.unsubscribe();
        this._updater.unsubscribe();

        this._networkSet.clear();
        this._notableChannelSet.clear();
        this._unreadCount.clear();
    }

    private _addNetwork(network: Network): void {
        this._networkSet.add(network);
        this._updater.next(undefined);
    }

    private _removedNetwork(network: Network): void {
        this._networkSet.delete(network);
        this._updater.next(undefined);
    }

    private _highlightChannel(message: RecievedMessage): void {
        const hasUnread: boolean = this._updateUnreadCount(message.channelId);
        const hasNotable: boolean = this._markAsNotable(message.channelId, message.message);

        if (hasUnread || hasNotable) {
            this._updater.next(undefined);
        }
    }

    private _markAsNotable(channelId: ChannelId, message: Message): boolean {
        const isNotable = isNotableMessage(message);
        if (isNotable) {
            this._notableChannelSet.add(channelId);
            return true;
        }
        else {
            return false;
        }
    }

    private _updateUnreadCount(channelId: ChannelId): boolean {
        const targetIsCurrent: boolean = this._currentId.mapOr(false, function(id){
            return id === channelId;
        });
        if (targetIsCurrent) {
            return false;
        }

        const current: number | void = this._unreadCount.get(channelId);
        if (current === undefined) {
            this._unreadCount.set(channelId, 0);
        }

        const latest = current + 1;
        this._unreadCount.set(channelId, latest);
        return true;
    }
}

function isNotableMessage(message: Message): boolean {
    const shouldHighlight = (message.type.indexOf('highlight') !== -1);
    const isQuery = (message.type.indexOf('query') !== -1);
    return shouldHighlight || isQuery;
}