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

import { Some, None, Option } from 'option-t';
import * as Rx from 'rxjs';

import { ChannelDomain, ChannelId } from './ChannelDomain';
import { RecievedMessage } from './Message';
import { NetworkSet } from './NetworkSet';
import { NetworkSetDomain } from './NetworkSetDomain';
import { NetworkDomain } from './NetworkDomain';

import { MessageGateway } from '../adapter/MessageGateway';
import { UIActionCreator } from '../intent/action/UIActionCreator';
import { UIActionDispatcher } from '../intent/dispatcher/UIActionDispatcher';

export const enum CurrentTabType {
    SETTING = 0,
    CHANNEL = 1,
}

export class SelectedTab {

    type: CurrentTabType;
    id: string | ChannelId;

    constructor(type: CurrentTabType, id: string | ChannelId) {
        this.type = type;
        this.id = id;
    }

    get channelId(): Option<ChannelId> {
        if (this.type === CurrentTabType.SETTING) {
            return new None<ChannelId>();
        }

        const id = parseInt(this.id as any, 10); // tslint:disable-line:no-any
        return new Some<ChannelId>(id);
    }
}

export class DomainState {

    private _networkSet: NetworkSetDomain;
    private _latestCurrentTab: SelectedTab | void;
    private _currentTab: Rx.Observable<SelectedTab>;
    private _notifiableMessage: Rx.Observable<RecievedMessage>;

    constructor(gateway: MessageGateway, uiAction: UIActionCreator) {
        this._networkSet = new NetworkSetDomain(gateway);
        this._latestCurrentTab = undefined;

        // In most of case, a rendering operation is depend on the source of `selectTab()`.
        // So this observable should be on the next event loop.
        this._currentTab = selectTab(gateway, uiAction.dispatcher(), this._networkSet).do((state: SelectedTab) => {
            this._latestCurrentTab = state;
        }).observeOn(Rx.Scheduler.asap).share();

        this._notifiableMessage = this._networkSet.recievedNotifiableMessage()
            .withLatestFrom(this._currentTab, function (data, current): RecievedMessage | void {
                const isSameChannel: boolean = current.channelId.mapOr(false, function (current: ChannelId) {
                    return data.channelId === current;
                });
                if (isSameChannel) {
                    return undefined;
                }

                return data;
            }).filter(function (data) {
                return data !== undefined;
                // tslint:disable-next-line:no-non-null-assertion
            }).map((data) => data!).share();
    }

    /**
     *  @deprecated
     */
    get networkSet(): NetworkSet {
        return this._networkSet.legacy;
    }

    get currentTab(): SelectedTab | void {
        return this._latestCurrentTab;
    }

    getCurrentTab(): Rx.Observable<SelectedTab> {
        return this._currentTab;
    }

    getSelectedChannel(): Rx.Observable<ChannelId> {
        return this.getCurrentTab().filter(function (state) {
            return state.channelId.isSome;
        }).map(function (state) {
            return state.channelId.expect('this should be unwrapped safely');
        });
    }

    getSelectedSetting(): Rx.Observable<string> {
        return this.getCurrentTab().filter(function (state) {
            return state.type === CurrentTabType.SETTING;
        }).map(function (state) {
            return state.id as string;
        });
    }

    getNetworkDomain(): NetworkSetDomain {
        return this._networkSet;
    }

    recievedNotifiableMessage(): Rx.Observable<RecievedMessage> {
        return this._notifiableMessage;
    }
}

function selectTab(gateway: MessageGateway, intent: UIActionDispatcher, set: NetworkSetDomain): Rx.Observable<SelectedTab> {
    const addedChannel = set.joinedChannelAtAll().map(function (channel) {
        const tab = new SelectedTab(CurrentTabType.CHANNEL, channel.getId());
        return tab;
    });

    const removedChannel = set.partedChannelAtAll().map(function (channel: ChannelDomain) {
        const parentNetwork = channel.getValue().getNetwork();
        // tslint:disable-next-line:no-non-null-assertion
        const nextId = parentNetwork!.getLobbyId();

        // FIXME: This should be passed Option<T>
        const tab = new SelectedTab(CurrentTabType.CHANNEL, nextId);
        return tab;
    });

    const addedNetwork = set.addedNetwork().map(function (domain: NetworkDomain) {
        const id = domain.getValue().getLobbyId();
        const tab = new SelectedTab(CurrentTabType.CHANNEL, id);
        return tab;
    });

    const removedNetwork = set.removedNetwork().withLatestFrom(set.getNetworkList(), function (_, list) {
        let tab: SelectedTab;
        if (list.length === 0) {
            tab = new SelectedTab(CurrentTabType.SETTING, 'connect');
        }
        else {
            const first = list[0];
            const id = first.getValue().getLobbyId();
            tab = new SelectedTab(CurrentTabType.CHANNEL, id);
        }
        return tab;
    });

    const shouldShowConnectSetting = gateway.showConnectSetting().map(function () {
        const tab = new SelectedTab(CurrentTabType.SETTING, 'connect');
        return tab;
    });

    const selectedChannel = intent.selectChannel.asObservable().map(function (channelId) {
        const tab = new SelectedTab(CurrentTabType.CHANNEL, channelId);
        return tab;
    });

    const selectedSettings = intent.showSomeSettings.map(function (id) {
        const tab = new SelectedTab(CurrentTabType.SETTING, id);
        return tab;
    });

    const initial = set.initialState().map(function (data) {
        let tab: SelectedTab;

        const idIsSetting = data.active.mapOr(true, function (id) {
            return (typeof id !== 'number');
        });
        if (idIsSetting) {
            tab = new SelectedTab(CurrentTabType.SETTING, 'connect');
        }
        else {
            tab = new SelectedTab(CurrentTabType.CHANNEL, data.active.expect('this should be channel id'));
        }
        return tab;
    });

    const tab = selectedChannel
        .merge(selectedSettings)
        .merge(addedChannel)
        .merge(removedChannel)
        .merge(addedNetwork)
        .merge(removedNetwork)
        .merge(shouldShowConnectSetting)
        .merge(initial);
    return tab;
}
