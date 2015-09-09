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

/// <reference path="../../../../node_modules/rx/ts/rx.all.es6.d.ts" />
/// <reference path="../../../../tsd/third_party/react/react.d.ts" />
/// <reference path="../../../../tsd/react.d.ts" />

import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import * as Rx from 'rx';

import {ChatWindowItem, ChatWindowList} from './ChatWindowItem';
import ConnectSettingViewController from './ConnectSettingViewController';
import {MessageContentViewController} from './MessageContentViewController';
import SignInViewController from './SignInViewController';

import CookieDriver from '../../adapter/CookieDriver';
import {SocketIoDriver} from '../../adapter/SocketIoDriver';
import {DomainState} from '../../domain/DomainState';
import Channel from '../../domain/Channel';
import {ChannelDomain} from '../../domain/ChannelDomain';
import {NetworkDomain} from '../../domain/NetworkDomain';
import UIActionCreator from '../../intent/action/UIActionCreator';

const CONNECT_INSERTION_POINT_ID = '#js-insertion-point-connect';

function arrayFlatMap<T, U>(target: Array<T>, fn: {(value: T): Array<U>}) : Array<U> {
    return target.reduce(function (result : Array<U>, element : T) {
        const mapped : Array<U> = fn(element);
        return result.concat(mapped);
    }, []);
}

export default class MainViewController {

    private _element: Element;
    private _channelMap: Map<number, MessageContentViewController>;
    private _disposer: Rx.IDisposable;

    private _chatContentArea: Element;
    private _signin: SignInViewController;
    private _connect :ConnectSettingViewController;

    constructor(domain: DomainState, element: Element, cookie: CookieDriver, socket: SocketIoDriver) {
        this._element = element;
        this._channelMap = new Map();

        const disposer = new Rx.CompositeDisposable();
        this._disposer = disposer;
        this._chatContentArea = element.querySelector('#chat');

        const networkDomain = domain.getNetworkDomain();
        disposer.add(networkDomain.joinedChannelAtAll().subscribe((channelDomain) => {
            const fragment: Node = <Node>createChannelFragment(channelDomain);
            const subtree = element = <Element>fragment.firstChild;
            const view = new MessageContentViewController(channelDomain, subtree);
            const id = channelDomain.getId();
            this._channelMap.set(id, view);
            this._chatContentArea.appendChild(subtree);

            UIActionCreator.showLatestInChannel(id);
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
                const view = new MessageContentViewController(channel, dom);
                this._channelMap.set(id, view);
            }

            UIActionCreator.setQuitConfirmDialog();
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

        this._signin = new SignInViewController(element.querySelector('#sign-in'), cookie, socket);

        this._connect = new ConnectSettingViewController( element.querySelector(CONNECT_INSERTION_POINT_ID), socket);
    }

    private _renderChannelList(list: Array<Channel>): void {
        const fragment = createChannelWindowListFragment(list);
        this._chatContentArea.appendChild(fragment);
        UIActionCreator.setQuitConfirmDialog();
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
