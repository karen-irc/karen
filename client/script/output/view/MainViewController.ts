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

import * as React from 'react';
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
            const fragment = createChannelWindowListFragment(channelList.map((v) => v.getValue()));
            this._chatContentArea.appendChild(fragment);
            for (const channel of channelList) {
                const id = channel.getId();
                const dom = document.getElementById('js-chan-' + String(id));
                const view = new MessageContentViewController(channel, dom);
                this._channelMap.set(id, view);
            }

            UIActionCreator.setQuitConfirmDialog();
        }));

        this._signin = new SignInViewController(element.querySelector('#sign-in'), cookie, socket);

        this._connect = new ConnectSettingViewController( element.querySelector(CONNECT_INSERTION_POINT_ID), socket);
    }
}

function createChannelFragment(domain: ChannelDomain): DocumentFragment {
    const reactTree = React.createElement(ChatWindowItem, {
        channel: domain.getValue(),
    });
    const html = React.renderToStaticMarkup(reactTree);

    const range = document.createRange();
    const fragment = range.createContextualFragment(html);
    return fragment;
}

function createChannelWindowListFragment(list: Array<Channel>): DocumentFragment {
    const reactTree = React.createElement(ChatWindowList, {
        list: list,
    });
    const html = React.renderToStaticMarkup(reactTree);

    const range = document.createRange();
    const fragment = range.createContextualFragment(html);
    return fragment;
}