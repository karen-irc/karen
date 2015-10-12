/*global $:true, moment: true */

/// <reference path="../../tsd/extends.d.ts" />
/// <reference path="../../node_modules/rx/ts/rx.all.es6.d.ts" />
/// <reference path="../../tsd/third_party/jquery/jquery.d.ts" />
/// <reference path="../../tsd/third_party/jqueryui/jqueryui.d.ts" />
/// <reference path="../../tsd/third_party/react/react.d.ts" />
/// <reference path="../../tsd/react.d.ts" />

import {Option} from 'option-t';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import * as Rx from 'rx';

import AppActionCreator from './intent/action/AppActionCreator';
import {AppView} from './output/view/AppView';
import {AuthRepository} from './adapter/AuthRepository';
import {Channel} from './domain/Channel';
import {CommandList} from './domain/CommandType';
import {ConfigRepository} from './adapter/ConfigRepository';
import {CookieDriver} from './adapter/CookieDriver';
import {DomainState} from './domain/DomainState';
import {SidebarFooterView} from './output/view/SidebarFooterView';
import {GeneralSettingView} from './output/view/GeneralSettingView';
import {InputBoxView} from './output/view/InputBoxView';
import {MainContentAreaView} from './output/view/MainContentAreaView';
import {MessageGateway} from './adapter/MessageGateway';
import {MessageList} from './output/view/MessageItem';
import {NotificationPresenter} from './output/NotificationPresenter';
import {SettingStore} from './output/viewmodel/SettingStore';
import {SidebarView} from './output/view/SidebarView';
import {SocketIoDriver} from './adapter/SocketIoDriver';
import {ToggleItem} from './output/view/ToggleItem';
import UIActionCreator from './intent/action/UIActionCreator';
import {User} from './domain/User';
import {WindowPresenter} from './output/WindowPresenter';

declare const momoent: any;

const socket = new SocketIoDriver();
const messageGateway = new MessageGateway(socket);
const cookie = new CookieDriver();
const config = new ConfigRepository(cookie);
const notify = new NotificationPresenter(config);
const auth = new AuthRepository(cookie);

const settingStore = new SettingStore(config);

document.addEventListener('DOMContentLoaded', function onLoad() {
    document.removeEventListener('DOMContentLoaded', onLoad);

    const globalState = new DomainState(messageGateway);
    const appWindow = new WindowPresenter(globalState);
    const appView = new AppView(document.getElementById('viewport'));
    const windows = new MainContentAreaView(globalState, document.getElementById('windows'), cookie, messageGateway);
    const inputBox = new InputBoxView(globalState, document.getElementById('js-form'));
    const settings = new GeneralSettingView(document.getElementById('settings'), settingStore);
    const sidebarView = new SidebarView(globalState, document.getElementById('sidebar'), messageGateway);
    const footer = new SidebarFooterView(globalState, messageGateway, document.getElementById('footer'));

    const sidebar = $('#sidebar');
    const chat = $('#chat');

    if (navigator.standalone) {
        document.documentElement.classList.add('web-app-mode');
    }

    socket.error().subscribe(function(e: any) {
        /*eslint-disable no-console*/
        console.log(e);
        /*eslint-enable*/
    });

    messageGateway.disconnected().subscribe(function(){
        AppActionCreator.reload();
    });

    socket.auth().subscribe(function(data: any) {
        const body: JQuery = $('body');
        const login: JQuery = $('#sign-in');
        if (!login.length) {
            AppActionCreator.reload();
            return;
        }
        login.find('.btn').prop('disabled', false);
        const token: Option<string> = auth.getToken();
        if (token.isSome) {
            auth.removeToken();
            socket.emit('auth', {token: token.unwrap()});
        }
        if (body.hasClass('signed-out')) {
            const error = login.find('.error');
            error.show().closest('form').one('submit', function() {
                error.hide();
            });
        }
        if (token.isNone) {
            body.addClass('signed-out');
        }
        const input: JQuery = login.find('input[name=\'user\']');
        if (input.val() === '') {
            input.val(auth.getUser().unwrapOr(''));
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

        sortable();
    });

    globalState.getCurrentTab().subscribe(function(state){
        chat.data('id', state.id);
        messageGateway.saveCurrentTab(state);
    });

    socket.more().subscribe(function(data) {
        const target = data.chan;
        const view = React.createElement(MessageList, {
            list: data.messages,
        });
        const html = ReactDOMServer.renderToStaticMarkup(view);

        const chan = chat
            .find('#js-chan-' + target)
            .find('.messages')
            .prepend(html)
            .end();
        if (data.messages.length !== 100) {
            chan.find('.show-more').removeClass('show');
        }
    });

    globalState.getNetworkDomain().addedNetwork().subscribe(function(domain){
        sortable();
    });

    const options = config.get();

    socket.toggle().subscribe(function(data) {
        const toggle = $('#toggle-' + data.id);
        const view = React.createElement(ToggleItem, {
            item: data,
        });
        const html = ReactDOMServer.renderToStaticMarkup(view);
        toggle.parent().after(html);
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

    settingStore.subscribe(Rx.Observer.create(function (option: any) { // FIXME
        const name = option.name;
        const value = option.value;

        const set = new Set([
            'join',
            'mode',
            'motd',
            'nick',
            'part',
            'quit',
        ]);
        if (set.has(name)) {
            chat.toggleClass('hide-' + name, !value);
        }

        if (name === 'colors') {
            chat.toggleClass('no-colors', !value);
        }
    }));

    UIActionCreator.dispatcher().toggleLeftPane.subscribe(function (shouldOpen) {
        if (shouldOpen) {
            chat.find('.chat').each(function(i, element) {
                element.addEventListener('click', function onClick(aEvent) {
                    aEvent.currentTarget.removeEventListener('click', onClick);
                    UIActionCreator.toggleLeftPane(false);
                });
            });
        }
    });

    // FIXME: Move to InputBoxViewController
    $(inputBox.textInput).tab(complete, {hint: false});

    const shouldShowLatestInChannel = UIActionCreator.dispatcher().showLatestInChannel.debounce(100)
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
        const target = '#js-chan-' + String(id);
        UIActionCreator.toggleLeftPane(false);
        $('#windows .active').removeClass('active');

        const chan = $(target)
            .addClass('active')
            .css('z-index', top++)
            .find('.chat')
            .end();

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

        if (screen.width > 768 && chan.hasClass('chan')) {
            UIActionCreator.focusInputBox();
        }
    });

    globalState.getSelectedSetting().subscribe(function(id) {
        const target = document.querySelector('#' + id);

        UIActionCreator.toggleLeftPane(false);
        $('#windows .active').removeClass('active');

        const chan = $(target)
            .addClass('active')
            .trigger('show')
            .css('z-index', top++)
            .find('.chat')
            .end();
    });

    AppActionCreator.dispatcher().signout.subscribe(function(){
        auth.removeToken();
    });

    chat.on('click', '.show-more-button', function() {
        const self = $(this);
        const count = self.parent().next('.messages').children().length;
        socket.emit('more', {
            target: self.data('id'),
            count: count
        });
    });

    chat.on('click', '.toggle-button', function() {
        const self = $(this);
        const chat = self.closest('.chat').get(0);
        const bottom = isScrollBottom(chat);
        const content = self.parent().next('.toggle-content');
        if (bottom && !content.hasClass('show')) {
            const img = content.find('img');
            if (img.length !== 0 && !img.width()) {
                img.on('load', function() {
                    chat.scrollTop = chat.scrollHeight;
                });
            }
        }
        content.toggleClass('show');
        if (bottom) {
            chat.scrollTop = chat.scrollHeight;
        }
    });

    function complete(word: string) {
        const words: Array<string> = CommandList.map(function(item){
            return item.toLowerCase();
        });
        const channel: Option<Channel> = globalState.currentTab.channelId.flatMap(function(channelId){
            const channel = globalState.networkSet.getChannelById(channelId);
            return channel;
        });
        const users: Option<Array<User>> = channel.map(function(channel){
            return channel.userList();
        });

        if (users.isSome) {
            for (let user of users.unwrap()) {
                const n = user.nickname;
                words.push(n.toLowerCase());
            }
        }

        return words.filter(function(word: string, item: string){
            return item.indexOf(word) === 0;
        }.bind(null, word.toLowerCase()));
    }

    function sortable() {
        sidebar.sortable({
            axis: 'y',
            containment: 'parent',
            cursor: 'grabbing',
            distance: 12,
            items: '.network',
            handle: '.lobby',
            placeholder: 'network-placeholder',
            forcePlaceholderSize: true,
            update: function() {
                const order: Array<string> = [];
                sidebar.find('.network').each(function() {
                    const id: string = <any>$(this).data('id');
                    order.push(id);
                });
                socket.emit(
                    'sort', {
                        type: 'networks',
                        order: order
                    }
                );
            }
        });
        sidebar.find('.network').sortable({
            axis: 'y',
            containment: 'parent',
            cursor: 'grabbing',
            distance: 12,
            items: '.chan:not(.lobby)',
            placeholder: 'chan-placeholder',
            forcePlaceholderSize: true,
            update: function(e, ui) {
                const order: Array<string> = [];
                const network = ui.item.parent();
                network.find('.chan').each(function() {
                    const id: string = <any>$(this).data('id');
                    order.push(id);
                });
                socket.emit(
                    'sort', {
                        type: 'channels',
                        target: network.data('id'),
                        order: order
                    }
                );
            }
        });
    }
});
