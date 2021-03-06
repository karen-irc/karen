import { Option } from 'option-t';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import * as Rx from 'rxjs';


import { AppView } from './output/view/AppView';

import { Channel } from './domain/Channel';
import { ChannelId } from './domain/ChannelDomain';
import { DomainState } from './domain/DomainState';
import { SidebarFooterView } from './output/view/SidebarFooterView';
import { GeneralSettingContext } from './settings/context/GeneralSettingContext';
import { InputBoxView } from './output/view/InputBoxView';
import { MainContentAreaView } from './output/view/MainContentAreaView';
import { MessageGateway } from './adapter/MessageGateway';
import { MessageList } from './output/view/MessageItem';
import { SidebarContext } from './output/context/SidebarContext';
import { SocketIoDriver } from './adapter/SocketIoDriver';
import { ToggleItem } from './output/view/ToggleItem';

import { WindowPresenter } from './output/WindowPresenter';

import { RizeClient } from './rize';

declare global { // tslint:disable-line:no-namespace
    interface Window {
        gKarenClientApp: RizeClient;
    }
}
window.gKarenClientApp = new RizeClient();

const socket = new SocketIoDriver();
const messageGateway = new MessageGateway(socket, window.gKarenClientApp.intent.message);

document.addEventListener('DOMContentLoaded', function onLoad() {
    document.removeEventListener('DOMContentLoaded', onLoad);

    const intent = window.gKarenClientApp.intent;
    const notifyAction = intent.notify;
    const uiAction = intent.ui;
    const globalState = new DomainState(messageGateway, uiAction);
    const auth = window.gKarenClientApp.auth;

    window.gKarenClientApp.appWindow = new WindowPresenter(globalState, intent.app, notifyAction, uiAction);
    // tslint:disable-next-line:no-non-null-assertion
    window.gKarenClientApp.appView = new AppView(document.getElementById('viewport')!, uiAction);
    // tslint:disable-next-line:no-non-null-assertion
    window.gKarenClientApp.windows = new MainContentAreaView(globalState, document.getElementById('windows')!, window.gKarenClientApp.cookie, messageGateway, intent.message, uiAction);
    // tslint:disable-next-line:no-non-null-assertion
    window.gKarenClientApp.inputBox = new InputBoxView(globalState, document.getElementById('js-form')!, intent.message, uiAction);
    window.gKarenClientApp.settings = new GeneralSettingContext(window.gKarenClientApp.config, notifyAction);
    window.gKarenClientApp.sidebarView = new SidebarContext(globalState, intent.message, uiAction);
    // tslint:disable-next-line:no-non-null-assertion
    window.gKarenClientApp.sidebarView.onActivate(document.getElementById('sidebar')!);
    // tslint:disable-next-line:no-non-null-assertion
    window.gKarenClientApp.footer = new SidebarFooterView(globalState, document.getElementById('footer')!, intent.app, uiAction);
    // tslint:disable-next-line:no-non-null-assertion
    window.gKarenClientApp.settings.onActivate(document.getElementById('settings')!);

    const chat = document.getElementById('chat');

    messageGateway.disconnected().subscribe(function () {
        intent.app.reload();
    });

    socket.auth().subscribe(function (_: any) { // tslint:disable-line:no-any
        const body: HTMLElement = window.document.body;
        const login = document.getElementById('sign-in');
        if (login === null) {
            intent.app.reload();
            return;
        }
        // @ts-ignore
        Array.from(login.querySelectorAll('.btn')).forEach(function (element: HTMLInputElement) {
            element.disabled = false;
        });
        const token: Option<string> = auth.getToken();
        if (token.isSome) {
            auth.removeToken();
            socket.emit('auth', { token: token.unwrap() });
        }
        if (body.classList.contains('signed-out')) {
            const error = login.querySelector('.error') as HTMLElement;
            error.style.display = '';
            // tslint:disable-next-line:no-non-null-assertion
            const form = login.querySelector('.container')!;
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

        uiAction.showSignIn();
    });

    globalState.getNetworkDomain().initialState().subscribe(function (data) {
        if (data.token) {
            auth.setToken(data.token);
        }

        document.body.classList.remove('signed-out');

        // tslint:disable-next-line:no-non-null-assertion
        const signinButtom = document.getElementById('sign-in')!;
        // tslint:disable-next-line:no-non-null-assertion
        signinButtom.parentNode!.removeChild(signinButtom);
    });

    globalState.getCurrentTab().subscribe(function (state) {
        // tslint:disable-next-line:no-non-null-assertion
        chat!.setAttribute('data-js-id', String(state.id));
        messageGateway.saveCurrentTab(state);
    });

    socket.more().subscribe(function (data) {
        const target = data.chan;
        const view = React.createElement(MessageList, {
            list: data.messages,
        });
        const html = ReactDOMServer.renderToStaticMarkup(view);
        // tslint:disable-next-line:no-non-null-assertion
        const chan = document.getElementById('js-chan-' + target)!;
        (chan.querySelector('.messages') as HTMLElement).insertAdjacentHTML('afterbegin', html);
        if (data.messages.length !== 100) {
            // tslint:disable-next-line:no-non-null-assertion
            chan.querySelector('.show-more')!.classList.remove('show');
        }
    });

    const options = window.gKarenClientApp.config.get();

    socket.toggle().subscribe(function (data) {
        // tslint:disable-next-line:no-non-null-assertion
        const toggle = document.getElementById('toggle-' + data.id)!;
        const view = React.createElement(ToggleItem, {
            item: data,
        });
        const html = ReactDOMServer.renderToStaticMarkup(view);
        // tslint:disable-next-line:no-non-null-assertion
        toggle.parentElement!.insertAdjacentHTML('afterend', html);
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

    window.gKarenClientApp.config.asObservable().subscribe((settings) => { // FIXME
        // tslint:disable-next-line:no-non-null-assertion
        const classList = chat!.classList;
        [
            ['join', settings.join],
            ['mode', settings.mode],
            ['motd', settings.motd],
            ['nick', settings.nick],
            ['part', settings.part],
            ['quit', settings.quit],
            // @ts-ignore
        ].forEach(([name, value]: [string, boolean]) => {
            const className = 'hide-' + name;
            if (!value) {
                classList.remove(className);
            }
            else {
                classList.add(className);
            }
        });
    });

    uiAction.dispatcher().toggleLeftPane.subscribe(function (shouldOpen) {
        if (!shouldOpen) {
            return;
        }

        // tslint:disable-next-line:no-non-null-assertion
        const nodelist: NodeListOf<Element> = chat!.querySelectorAll('.chat');
        const list: Array<Element> = Array.from(nodelist);
        list.forEach(function (element: Element) {
            element.addEventListener('click', function onClick(aEvent: Event) {
                aEvent.currentTarget.removeEventListener('click', onClick);
                uiAction.toggleLeftPane(false);
            });
        });
    });

    const shouldShowLatestInChannel: Rx.Observable<ChannelId> =
        uiAction.dispatcher().showLatestInChannel.asObservable().debounceTime(100)
            .merge(globalState.getSelectedChannel());
    shouldShowLatestInChannel.subscribe(function (channelId) {
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
    globalState.getSelectedChannel().subscribe(function (id) {
        // tslint:disable-next-line:no-non-null-assertion
        const target = document.getElementById('js-chan-' + String(id))!;
        uiAction.toggleLeftPane(false);
        const active = document.querySelector('#windows .active');
        if (!!active) {
            active.classList.remove('active');
        }

        target.classList.add('active');
        (target as HTMLElement).style.zIndex = String(top++);

        const channel = globalState.networkSet.getChannelById(id);
        const network = channel.map(function (channel: Channel) {
            return channel.getNetwork();
        }).orElse(function () {
            return globalState.networkSet.getById(id);
        });
        if (network.isSome) {
            // tslint:disable-next-line:no-non-null-assertion
            const nickname = network.unwrap()!.nickname;
            window.gKarenClientApp.inputBox.setNickname(nickname);
        }

        if (screen.width > 768 && target.classList.contains('chan')) {
            uiAction.focusInputBox();
        }
    });

    globalState.getSelectedSetting().subscribe(function (id) {
        const target = document.querySelector('#' + id);

        uiAction.toggleLeftPane(false);
        const active = document.querySelector('#windows .active');
        if (!!active) {
            active.classList.remove('active');
        }

        // tslint:disable-next-line:no-non-null-assertion
        target!.classList.add('active');
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('show', true, true, null);
        // tslint:disable-next-line:no-non-null-assertion
        target!.dispatchEvent(evt);
        (target as HTMLElement).style.zIndex = String(top++);
    });
});

export async function a() {
    return 1;
}
