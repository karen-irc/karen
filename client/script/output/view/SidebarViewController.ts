/*global $: true */
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

/// <reference path="../../../../node_modules/rx/ts/rx.d.ts" />
/// <reference path="../../../../tsd/third_party/jquery/jquery.d.ts" />
/// <reference path="../../../../tsd/third_party/react/react.d.ts" />

import AppActionCreator from '../../intent/action/AppActionCreator';
import Channel from '../../domain/Channel';
import {ChannelItem} from './ChannelItem';
import CommandTypeMod from '../../domain/CommandType';
import {DomainState} from '../../domain/DomainState';
import MessageActionCreator from '../../intent/action/MessageActionCreator';
import Network from '../../domain/Network';
import {NetworkItemList} from './NetworkItemList';
import * as React from 'react';
import * as Rx from 'rx';
import UIActionCreator from '../../intent/action/UIActionCreator';

const CommandType = CommandTypeMod.type;

export default class SidebarViewController implements EventListenerObject {

    _element: Element;
    domain: DomainState;
    _disposeSignout: Rx.IDisposable;
    _disposeRenderNetworks: Rx.IDisposable;
    _disposeSelectChannel: Rx.IDisposable;
    _disposeAddedNetwork: Rx.IDisposable;
    _disposeDeletedNetwork: Rx.IDisposable;
    _disposePartFromChannel: Rx.IDisposable;

    _obsJoinChannel: Rx.Observable<number>;

    constructor(domain: DomainState, element: Element) {
        this._element = element;
        this.domain = domain;

        this._disposeSignout = AppActionCreator.getDispatcher().signout.subscribe(() => {
            this.clearAllNetworks();
            this.showEmptinesse();
        });

        this._disposeRenderNetworks = AppActionCreator.getDispatcher().renderNetworksInView.subscribe((networks) => {
            this.hideEmptinesse();
            this.renderNetworks(networks);
        });

        this._disposeSelectChannel = UIActionCreator.getDispatcher().selectChannel.subscribe((channelId) => {
            this.selectChannel(channelId);
        });

        this._disposeAddedNetwork = domain.networkSet.addedStream().subscribe((network: Network) => {
            this.addNetwork(network);
        });

        this._disposeDeletedNetwork = domain.networkSet.deletedStream().subscribe((network: Network) => {
            this.deleteNetwork(network);
        });

        this._disposePartFromChannel = MessageActionCreator.getDispatcher().partFromChannel.subscribe((id) => {
            this.removeChannel(id);
         });

        this._obsJoinChannel = MessageActionCreator.getDispatcher().joinChannel.flatMap((data) => {
            return this.joinChannel(data.networkId, data.channel);
        });

        element.addEventListener('click', this);
    }

    get joinChannelRendered(): Rx.Observable<number> {
        return this._obsJoinChannel;
    }

    handleEvent(aEvent: Event): void {
        switch (aEvent.type) {
            case 'click':
                this.onClick(aEvent);
        }
    }

    onClick(aEvent: Event): void {
        const target: any = aEvent.target;
        if (!target.matches('.js-sidebar-channel, .js-sidebar-channel > *')) {
            return;
        }

        // This is very heuristic way.
        let button = target;
        if (!target.classList.contains('js-sidebar-channel')) {
            button = <Element>target.parentNode;
        }

        const channelId = parseInt(button.getAttribute('data-id'), 10);

        const isCloseButton = target.classList.contains('close');
        if (isCloseButton) {
            this.closeChannel(channelId, button);
        }
        else {
            UIActionCreator.selectChannel(channelId);
        }
    }

    joinChannel(networkId: number, channel: Channel): Rx.Observable<number> {
        const network = this._element.querySelector('#network-' + String(networkId));
        if (!network) {
            return Rx.Observable.throw<number>(undefined);
        }

        this.appendChannel(<HTMLElement>network, channel);

        const id = channel.id;
        return Rx.Observable.just(id);
    }

    closeChannel(channelId: number, target: HTMLElement): void {
        const channelWrap = this.domain.networkSet.getChannelById(channelId);
        if (channelWrap.isNone) {
            return;
        }

        const channel = channelWrap.unwrap();
        const channelType = channel.type;
        const isLobby = (channelType === 'lobby');
        const command = isLobby ? CommandType.QUIT : CommandType.CLOSE;
        if (isLobby) {
            /*eslint-disable no-alert*/
            if (!window.confirm('Disconnect from ' + channel.name + '?')) {
                return;
            }
            /*eslint-enable*/
        }
        MessageActionCreator.inputCommand(channelId, command);

        // FIXME: This visual state should be written in css.
        target.style.opacity = '0.4';
    }

    clearAllNetworks(): void {
        let element = <HTMLElement>this._element.querySelector('.networks');
        element.innerHTML = '';
    }

    addNetwork(network: Network): void {
        this.hideEmptinesse();
        this.appendNetworks([network]);

        const channelList = network.getChannelList();
        const lastId = channelList[channelList.length - 1].id;
        UIActionCreator.selectChannel(lastId);
    }

    deleteNetwork(network: Network): void {
        const id = network.id;
        const target = this._element.querySelector('#network-' + String(id));
        if (!!target) {
            target.parentNode.removeChild(target);
        }

        const newTarget = this._element.querySelector('.chan');
        if (!newTarget) {
            this.showEmptinesse();
        }
        else {
            const newId = newTarget.getAttribute('data-id');
            UIActionCreator.selectChannel( parseInt(newId, 10) );
        }
    }

    showEmptinesse(): void {
        let element = <HTMLElement>this._element.querySelector('.empty');
        element.style.display = 'block';
    }

    hideEmptinesse(): void {
        let element = <HTMLElement>this._element.querySelector('.empty');
        element.style.display = 'none';
    }

    renderNetworks(networks: Array<Network>): void {
        const element = <HTMLElement>this._element.querySelector('.networks');
        const view = React.createElement(NetworkItemList, {
            list: networks,
        });
        const html = React.renderToStaticMarkup(view);

        element.innerHTML = html;
    }

    appendNetworks(networks: Array<Network>): void {
        const element = <HTMLElement>this._element.querySelector('.networks');
        const view = React.createElement(NetworkItemList, {
            list: networks,
        });
        const html = React.renderToStaticMarkup(view);

        element.innerHTML = element.innerHTML + html;
    }

    appendChannel(network: HTMLElement, channel: Channel): void {
        const view = React.createElement(ChannelItem, {
            channel: channel,
        });
        const html = React.renderToStaticMarkup(view);

        network.innerHTML = network.innerHTML + html;
    }

    selectChannel(id: number): void {
        const active = this._element.querySelector('.active');
        if (!!active) {
            active.classList.remove('active');
        }

        const selector = '.js-sidebar-channel[data-id="' + String(id) + '"]';
        let target = this._element.querySelector(selector);
        if (!target) {
            const first = this._element.querySelector('.js-sidebar-channel');
            if (!!first) {
                target = first;
            }
            else {
                return;
            }
        }

        target.classList.add('active');

        const badge = target.querySelector('.badge');
        if (!!badge) {
            badge.classList.remove('highlight');
            // FIXME:
            $(badge).data('count', '');
            badge.textContent = '';
        }
    }

    removeChannel(id: number): void {
        const element = this._element.querySelector('.js-sidebar-channel[data-id=\'' + String(id) + '\']');
        element.parentNode.removeChild(element);

        // FIXME: This should be passed Option<T>.
        const channelId = this.domain.currentTab.channelId.unwrapOr(-1);
        UIActionCreator.selectChannel(channelId);
    }
}
