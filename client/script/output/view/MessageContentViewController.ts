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

import {ChatWindowItem} from './ChatWindowItem';
import {UserList} from './UserList';

import {ChannelDomain} from '../../domain/ChannelDomain';
import User from '../../domain/User';

export class MessageContentViewController {

    private _element: Element;
    private _userElement: Element;
    private _topicElement: Element;

    private _disposer: Rx.IDisposable;

    constructor(domain: ChannelDomain) {
        const fragment: Node = <Node>createChannelFragment(domain);
        this._element = <Element>fragment.firstChild;
        this._userElement = this._element.querySelector('.js-users');
        this._topicElement = this._element.querySelector('.js-topic');

        const disposer: Rx.CompositeDisposable = new Rx.CompositeDisposable();
        this._disposer = disposer;

        disposer.add(domain.updatedUserList().subscribe((list: Array<User>) => {
            this._updateUserList(list);
        }));

        disposer.add(domain.updatedTopic().subscribe((topic: string) => {
            this._updateTopic(topic);
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
        });
        React.render(view, this._userElement);
    }

    private _updateTopic(topic: string): void {
        this._topicElement.textContent = topic;
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