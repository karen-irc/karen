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
import * as ReactDOM from 'react-dom';
import * as ReactDOMServer from 'react-dom/server';
import * as Rx from 'rx';

import {MessageItem} from './MessageItem';
import {UserList} from './UserList';

import {ChannelDomain} from '../../domain/ChannelDomain';
import {Message} from '../../domain/Message';
import {User} from '../../domain/User';
import MessageActionCreator from '../../intent/action/MessageActionCreator';
import UIActionCreator from '../../intent/action/UIActionCreator';

export class MessageContentViewController {

    private _channelId: number;
    private _element: Element;
    private _userElement: Element;
    private _topicElement: Element;
    private _messageArea: Element;
    private _messageContainer: Element;
    private _showMore: Element;

    private _disposer: Rx.IDisposable;

    constructor(domain: ChannelDomain, element: Element) {
        this._channelId = domain.getId();

        this._element = element;
        this._userElement = this._element.querySelector('.js-users');
        this._topicElement = this._element.querySelector('.js-topic');
        this._messageArea = this._element.querySelector('.chat');
        this._messageContainer = this._element.querySelector('.messages');
        this._showMore = this._element.querySelector('.show-more');

        const disposer: Rx.CompositeDisposable = new Rx.CompositeDisposable();
        this._disposer = disposer;

        disposer.add(domain.updatedUserList().subscribe((list: Array<User>) => {
            this._updateUserList(list);
        }));

        disposer.add(domain.updatedTopic().subscribe((topic: string) => {
            this._updateTopic(topic);
        }));

        disposer.add(domain.recievedMessage().subscribe((message: Message) => {
            this._renderMessage(message);
        }));

        disposer.add(MessageActionCreator.getDispatcher().clearMessage.subscribe((id: number) => {
            if (this._channelId !== id) {
                return;
            }

            // FIXME: this should be scheduled on `requestAnimationFrame`.
            this._clearMessages();
            this._showMoreButton();
        }));
    }

    dispose(): void {
        this._disposer.dispose();
        this._disposer = null;
        this._element = null;
    }

    getElement(): Element {
        return this._element;
    }

    private _updateUserList(list: Array<User>): void {
        const view = React.createElement(UserList, {
            list: list,
            channelId: this._channelId,
        });
        ReactDOM.render(view, this._userElement);
    }

    private _updateTopic(topic: string): void {
        this._topicElement.textContent = topic;
    }

    private _renderMessage(message: Message): void {
        const shouldBottom = isScrollBottom(this._messageArea);
        const fragment = createMessageFragment(message);
        this._messageContainer.appendChild(fragment);

        if (shouldBottom) {
            this._messageArea.scrollTop = this._messageArea.scrollHeight;
        }
    }

    private _clearMessages(): void {
        const range = document.createRange();
        range.selectNodeContents(this._messageContainer);
        range.deleteContents();
    }

    private _showMoreButton(): void {
        this._showMore.classList.add('show');
    }
}

function createMessageFragment(message: Message): DocumentFragment {
    const reactTree = React.createElement(MessageItem, {
        message: message,
    });
    const html = ReactDOMServer.renderToStaticMarkup(reactTree);

    const range = document.createRange();
    range.selectNode(document.body);
    const fragment = range.createContextualFragment(html);
    return fragment;
}

function isScrollBottom(target: Element): boolean {
    const isBottom = ((target.scrollTop | 0) + (target.clientHeight | 0) + 1) >= (target.scrollHeight | 0);
    return isBottom;
}
