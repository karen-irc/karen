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

import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import * as Rx from 'rxjs';

import {MessageActionCreator} from '../../intent/action/MessageActionCreator';

import {ChatWindowItem, ChatWindowList} from './ChatWindowItem';
import {ConnectSettingContext} from '../../settings/context/ConnectSettingContext';
import {MessageContentView} from './MessageContentView';
import {SignInView} from '../../settings/view/SignInView';

import {CookieDriver} from '../../adapter/CookieDriver';
import {MessageGateway} from '../../adapter/MessageGateway';
import {DomainState} from '../../domain/DomainState';
import {Channel} from '../../domain/Channel';
import {ChannelDomain, ChannelId} from '../../domain/ChannelDomain';
import {NetworkDomain} from '../../domain/NetworkDomain';
import {UIActionCreator} from '../../intent/action/UIActionCreator';

const CONNECT_INSERTION_POINT_ID = '#js-insertion-point-connect';

function arrayFlatMap<T, U>(target: Array<T>, fn: {(value: T): Array<U>}) : Array<U> {
    return target.reduce(function (result : Array<U>, element : T) {
        const mapped : Array<U> = fn(element);
        return result.concat(mapped);
    }, []);
}

export class MainContentAreaView {

    private _uiAction: UIActionCreator;
    private _element: Element;
    private _channelMap: Map<ChannelId, MessageContentView>;
    private _disposer: Rx.Subscription;

    private _chatContentArea: Element;
    private _signin: SignInView;
    private _connect: ConnectSettingContext;

    constructor(domain: DomainState, element: Element, cookie: CookieDriver,
                gateway: MessageGateway, messageAction: MessageActionCreator, uiAction: UIActionCreator) {
        this._uiAction = uiAction;
        this._element = element;
        this._channelMap = new Map();

        const disposer = new Rx.Subscription();
        this._disposer = disposer;
        this._chatContentArea = element.querySelector('#chat')!;

        const networkDomain = domain.getNetworkDomain();
        disposer.add(networkDomain.joinedChannelAtAll().subscribe((channelDomain) => {
            const fragment: Node = createChannelFragment(channelDomain) as Node;
            const subtree = element = fragment.firstChild as Element;
            const view = new MessageContentView(channelDomain, subtree, messageAction, uiAction);
            const id = channelDomain.getId();
            this._channelMap.set(id, view);
            this._chatContentArea.appendChild(subtree);

            uiAction.showLatestInChannel(id);
        }));

        disposer.add(networkDomain.partedChannelAtAll().subscribe((channelDomain) => {
            const id = channelDomain.getId();
            const view = this._channelMap.get(id);
            if (view === undefined) {
                throw new Error('should find some item');
            }

            this._channelMap.delete(id);

            const element = view.getElement();
            element.parentNode.removeChild(element);

            view.dispose();
        }));

        disposer.add(networkDomain.addedNetwork().subscribe((domain: NetworkDomain) => {
            const channelList = domain.getChannelDomainList();
            this._renderChannelList(channelList.map((v) => v.getValue()));

            for (const channel of channelList) {
                const id = channel.getId();
                const dom = document.getElementById('js-chan-' + String(id));
                const view = new MessageContentView(channel, dom!, messageAction, uiAction);
                this._channelMap.set(id, view);
            }

            uiAction.setQuitConfirmDialog();
        }));

        disposer.add(networkDomain.initialState().subscribe((initState) => {
            if (initState.domain.length === 0) {
                return;
            }

            const channels: Array<Channel> = arrayFlatMap(initState.domain, function(domain: NetworkDomain){
                const network = domain.getValue();
                return network.getChannelList();
            });

            this._renderChannelList(channels);
        }));

        this._signin = new SignInView(element.querySelector('#sign-in')!, cookie, gateway.socket());

        this._connect = new ConnectSettingContext(gateway);
        this._connect.onActivate(element.querySelector(CONNECT_INSERTION_POINT_ID)!);
    }

    private _renderChannelList(list: Array<Channel>): void {
        const fragment = createChannelWindowListFragment(list);
        this._chatContentArea.appendChild(fragment);
        this._uiAction.setQuitConfirmDialog();
    }
}

function createChannelFragment(domain: ChannelDomain): DocumentFragment {
    const reactTree = React.createElement(ChatWindowItem, {
        channel: domain.getValue(),
    });
    const html = ReactDOMServer.renderToStaticMarkup(reactTree);

    const range = document.createRange();
    range.selectNode(document.body);
    const fragment = range.createContextualFragment(html);
    return fragment;
}

function createChannelWindowListFragment(list: Array<Channel>): DocumentFragment {
    const reactTree = React.createElement(ChatWindowList, {
        list: list,
    });
    const html = ReactDOMServer.renderToStaticMarkup(reactTree);

    const range = document.createRange();
    range.selectNode(document.body);
    const fragment = range.createContextualFragment(html);
    return fragment;
}
