// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMServer from 'react-dom/server';
import * as Rx from 'rxjs';

import {MessageItem} from './MessageItem';
import {UserList} from './UserList';

import {ChannelDomain, ChannelId} from '../../domain/ChannelDomain';
import {Message} from '../../domain/Message';
import {User} from '../../domain/User';
import {MessageActionCreator} from '../../intent/action/MessageActionCreator';
import {UIActionCreator} from '../../intent/action/UIActionCreator';

export class MessageContentView {

    private _channelId: ChannelId;
    private _element: Element;
    private _userElement: Element;
    private _topicElement: Element;
    private _messageArea: Element;
    private _messageContainer: Element;
    private _showMore: Element;
    private _showMoreButtonElement: Element;
    private _closeButton: Element;

    private _disposer: Rx.Subscription;

    private _msgAction: MessageActionCreator;

    constructor(domain: ChannelDomain, element: Element, msgAction: MessageActionCreator, uiAction: UIActionCreator) {
        this._channelId = domain.getId();

        this._element = element;
        this._userElement = this._element.querySelector('.js-users');
        this._topicElement = this._element.querySelector('.js-topic');
        this._messageArea = this._element.querySelector('.chat');
        this._messageContainer = this._element.querySelector('.messages');
        this._showMore = this._element.querySelector('.show-more');
        this._showMoreButtonElement = this._element.querySelector('.show-more-button');
        this._closeButton = this._element.querySelector('.js-chatwindow-close');

        const disposer = new Rx.Subscription();
        this._disposer = disposer;

        this._msgAction = msgAction;

        disposer.add(domain.updatedUserList().subscribe((list: Array<User>) => {
            this._updateUserList(list);
        }));

        disposer.add(domain.updatedTopic().subscribe((topic: string) => {
            this._updateTopic(topic);
        }));

        disposer.add(domain.recievedMessage().subscribe((message: Message) => {
            this._renderMessage(message);
        }));

        disposer.add(Rx.Observable.fromEvent(this._closeButton, 'click').subscribe(() => {
            uiAction.tryCloseChannel(this._channelId);
        }));

        disposer.add(Rx.Observable.fromEvent(this._showMoreButtonElement, 'click').subscribe(() => {
            this._fetchHiddenLog();
        }));

        disposer.add(Rx.Observable.fromEvent(this._messageArea, 'click').subscribe((event: Event) => {
            const target = event.target as Element;
            if (target.classList.contains('toggle-button')) {
                this._toggleInlineContentContainer(target);
                uiAction.toggleInlineImage();
            }
        }));

        disposer.add(uiAction.dispatcher().toggleInlineImage.subscribe(() => {
            this._scrollToBottom();
        }));

        disposer.add(msgAction.dispatcher().clearMessage.subscribe((id: ChannelId) => {
            if (this._channelId !== id) {
                return;
            }

            // FIXME: this should be scheduled on `requestAnimationFrame`.
            this._clearMessages();
            this._showMoreButton();
        }));

       disposer.add(Rx.Observable.interval(10 * 1000).subscribe(() => {
           const target = this._element;
           const children = Array.from(target.childNodes).slice(0, -100);
           for (const element of children) {
               element.parentNode.removeChild(element);
           }

           if (children.length) {
               this._showMoreButton();
           }
       }));
    }

    dispose(): void {
        this._disposer.unsubscribe();
    }

    getElement(): Element {
        return this._element;
    }

    private _updateUserList(list: Array<User>): void {
        const view = React.createElement(UserList, {
            list: list,
            channelId: this._channelId,
            action: this._msgAction,
        });
        ReactDOM.render(view, this._userElement);
    }

    private _updateTopic(topic: string): void {
        this._topicElement.textContent = topic;
    }

    private _renderMessage(message: Message): void {
        const fragment = createMessageFragment(message);
        this._messageContainer.appendChild(fragment);
        this._scrollToBottom();
    }

    private _clearMessages(): void {
        const range = document.createRange();
        range.selectNodeContents(this._messageContainer);
        range.deleteContents();
    }

    private _showMoreButton(): void {
        this._showMore.classList.add('show');
    }

    private _fetchHiddenLog(): void {
        const LENGTH = 100; // This value is same as the number of max display messages.
        this._msgAction.fetchHiddenLog(this._channelId, LENGTH);
    }

    private _scrollToBottom(): void {
        const shouldBottom = isScrollBottom(this._messageArea);
        if (shouldBottom) {
            this._messageArea.scrollTop = this._messageArea.scrollHeight;
        }
    }

    private _toggleInlineContentContainer(element: Element): void {
        const container = element.parentNode.nextSibling;
        (container as Element).classList.toggle('show');
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
