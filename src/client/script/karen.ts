import {Option} from 'option-t';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import * as Rx from 'rxjs';

import {AppActionCreator} from './intent/action/AppActionCreator';
import {AppView} from './output/view/AppView';
import {AuthRepository} from './adapter/AuthRepository';
import {Channel} from './domain/Channel';
import {ChannelId} from './domain/ChannelDomain';
import {ConfigRepository} from './settings/repository/ConfigRepository';
import {CookieDriver} from './adapter/CookieDriver';
import {DomainState} from './domain/DomainState';
import {SidebarFooterView} from './output/view/SidebarFooterView';
import {GeneralSettingContext} from './settings/context/GeneralSettingContext';
import {InputBoxView} from './output/view/InputBoxView';
import {MainContentAreaView} from './output/view/MainContentAreaView';
import {MessageActionCreator} from './intent/action/MessageActionCreator';
import {MessageGateway} from './adapter/MessageGateway';
import {MessageList} from './output/view/MessageItem';
import {NotificationActionCreator} from './intent/action/NotificationActionCreator';
import {NotificationPresenter} from './output/NotificationPresenter';
import {SidebarContext} from './output/context/SidebarContext';
import {SocketIoDriver} from './adapter/SocketIoDriver';
import {ToggleItem} from './output/view/ToggleItem';
import UIActionCreator from './intent/action/UIActionCreator';
import {WindowPresenter} from './output/WindowPresenter';

declare const momoent: any;
declare const process: {
    env: any;
};

const appAction = new AppActionCreator();
const messageAction = new MessageActionCreator();
const notifyAction = new NotificationActionCreator();

const socket = new SocketIoDriver();
const messageGateway = new MessageGateway(socket, messageAction);
const cookie = new CookieDriver();
const config = new ConfigRepository(cookie);
/* tslint:disable no-unused-variable */
const notify = new NotificationPresenter(config, notifyAction);
/* tslint:enable */
const auth = new AuthRepository(cookie);

document.addEventListener('DOMContentLoaded', function onLoad() {
    document.removeEventListener('DOMContentLoaded', onLoad);

    const globalState = new DomainState(messageGateway);
    /* tslint:disable no-unused-variable */
    const appWindow = new WindowPresenter(globalState, appAction, notifyAction);
    const appView = new AppView(document.getElementById('viewport'));
    const windows = new MainContentAreaView(globalState, document.getElementById('windows'), cookie, messageGateway, messageAction);
    const inputBox = new InputBoxView(globalState, document.getElementById('js-form'), messageAction);
    const settings = new GeneralSettingContext(config, notifyAction);
    const sidebarView = new SidebarContext(globalState, messageAction);
    sidebarView.onActivate(document.getElementById('sidebar'));
    const footer = new SidebarFooterView(globalState, messageGateway, document.getElementById('footer'), appAction);
    /* tslint:enable */
    settings.onActivate(document.getElementById('settings'));

    const chat = document.getElementById('chat');

    messageGateway.disconnected().subscribe(function(){
        appAction.reload();
    });

    socket.auth().subscribe(function(data: any) {
        const body: HTMLElement = window.document.body;
        const login = document.getElementById('sign-in');
        if (login === null) {
            appAction.reload();
            return;
        }
        Array.from(login.querySelectorAll('.btn')).forEach(function(element: HTMLInputElement){
            element.disabled = false;
        });
        const token: Option<string> = auth.getToken();
        if (token.isSome) {
            auth.removeToken();
            socket.emit('auth', {token: token.unwrap()});
        }
        if (body.classList.contains('signed-out')) {
            const error = login.querySelector('.error') as HTMLElement;
            error.style.display = '';
            const form = login.querySelector('.container');
            form.addEventListener('submit', function onSubmit() {
                form.removeEventListener('submit', onSubmit);
                error.style.display = 'none';
            });
        }
        if (token.isNone) {
            body.classList.add('signed-out');
        }
        const input = login.querySelector('input[name=\'user\']') as HTMLInputElement;
        if (input.value === '') {
            input.value = auth.getUser().unwrapOr('');
        }
        if (token.isSome) {
            return;
        }

        UIActionCreator.showSignIn();
    });

    globalState.getNetworkDomain().initialState().subscribe(function(data) {
        if (data.token) {
            auth.setToken(data.token);
        }

        document.body.classList.remove('signed-out');

        const signinButtom = document.getElementById('sign-in');
        signinButtom.parentNode.removeChild(signinButtom);
    });

    globalState.getCurrentTab().subscribe(function(state){
        chat.setAttribute('data-js-id', String(state.id));
        messageGateway.saveCurrentTab(state);
    });

    socket.more().subscribe(function(data) {
        const target = data.chan;
        const view = React.createElement(MessageList, {
            list: data.messages,
        });
        const html = ReactDOMServer.renderToStaticMarkup(view);
        const chan = document.getElementById('js-chan-' + target);
        (chan.querySelector('.messages') as HTMLElement).insertAdjacentHTML('afterbegin', html);
        if (data.messages.length !== 100) {
            chan.querySelector('.show-more').classList.remove('show');
        }
    });

    const options = config.get();

    socket.toggle().subscribe(function(data) {
        const toggle = document.getElementById('toggle-' + data.id);
        const view = React.createElement(ToggleItem, {
            item: data,
        });
        const html = ReactDOMServer.renderToStaticMarkup(view);
        toggle.parentElement.insertAdjacentHTML('afterend', html);
        switch (data.type) {
        case 'link':
            if (options.links) {
                toggle.click();
            }
            break;

        case 'image':
            if (options.thumbnails) {
                toggle.click();
            }
            break;
        }
    });

    config.asObservable().subscribe((settings) => { // FIXME
        const classList = chat.classList;
        [
            ['join', settings.join],
            ['mode', settings.mode],
            ['motd', settings.motd],
            ['nick', settings.nick],
            ['part', settings.part],
            ['quit', settings.quit],
        ].forEach(([name, value]: [string, boolean]) => {
            const className = 'hide-' + name;
            if (!value) {
                classList.remove(className);
            }
            else {
                classList.add(className);
            }
        });

        if (!settings.colors) {
            classList.remove('no-colors');
        }
        else {
            classList.add('no-colors');
        }
    });

    UIActionCreator.dispatcher().toggleLeftPane.subscribe(function (shouldOpen) {
        if (!shouldOpen) {
            return;
        }

        const nodelist: NodeListOf<Element> = chat.querySelectorAll('.chat');
        const list: Array<Element> = Array.from(nodelist);
        list.forEach(function(element: Element){
            element.addEventListener('click', function onClick(aEvent: Event) {
                aEvent.currentTarget.removeEventListener('click', onClick);
                UIActionCreator.toggleLeftPane(false);
            });
        });
    });

    const shouldShowLatestInChannel: Rx.Observable<ChannelId> =
        UIActionCreator.dispatcher().showLatestInChannel.debounceTime(100)
        .merge(globalState.getSelectedChannel());
    shouldShowLatestInChannel.subscribe(function(channelId){
        const targetChanel = document.getElementById('js-chan-' + String(channelId));
        if (!targetChanel) {
            return;
        }
        const targetBox = document.querySelector('.chat');
        if (!targetBox) {
            return;
        }

        const isBottom = isScrollBottom(targetBox);
        if (isBottom) {
            return;
        }

        // move to bottom
        targetBox.scrollTop = targetBox.scrollHeight;
    });

    function isScrollBottom(target: Element): boolean {
        const isBottom = ((target.scrollTop | 0) + (target.clientHeight | 0) + 1) >= (target.scrollHeight | 0);
        return isBottom;
    }

    let top = 1;
    globalState.getSelectedChannel().subscribe(function(id){
        const target = document.getElementById('js-chan-' + String(id));
        UIActionCreator.toggleLeftPane(false);
        const active = document.querySelector('#windows .active');
        if (!!active) {
            active.classList.remove('active');
        }

        target.classList.add('active');
        (target as HTMLElement).style.zIndex = String(top++);

        const channel = globalState.networkSet.getChannelById(id);
        const network = channel.map(function(channel: Channel){
            return channel.getNetwork();
        }).orElse(function() {
            return globalState.networkSet.getById(id);
        });
        if (network.isSome) {
            const nickname = network.unwrap().nickname;
            inputBox.setNickname(nickname);
        }

        if (screen.width > 768 && target.classList.contains('chan')) {
            UIActionCreator.focusInputBox();
        }
    });

    globalState.getSelectedSetting().subscribe(function(id) {
        const target = document.querySelector('#' + id);

        UIActionCreator.toggleLeftPane(false);
        const active = document.querySelector('#windows .active');
        if (!!active) {
            active.classList.remove('active');
        }

        target.classList.add('active');
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('show', true, true, null);
        target.dispatchEvent(evt);
        (target as HTMLElement).style.zIndex = String(top++);
    });

    appAction.dispatcher().signout.subscribe(function(){
        auth.removeToken();
    });
});
