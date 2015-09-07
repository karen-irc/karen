/*global $:true, moment: true */

/// <reference path="../../tsd/core-js.d.ts" />
/// <reference path="../../tsd/extends.d.ts" />
/// <reference path="../../node_modules/rx/ts/rx.all.es6.d.ts" />
/// <reference path="../../node_modules/option-t/option-t.d.ts" />
/// <reference path="../../tsd/third_party/jquery/jquery.d.ts" />
/// <reference path="../../tsd/third_party/jqueryui/jqueryui.d.ts" />
/// <reference path="../../tsd/third_party/react/react.d.ts" />

// babel's `es6.forOf` transform uses `Symbol` and 'Array[Symbol.iterator]'.
import 'core-js/modules/es6.array.iterator';
import 'core-js/es6/symbol';

import arrayFrom from 'core-js/library/fn/array/from';

import AppActionCreator from './intent/action/AppActionCreator';
import AppViewController from './output/view/AppViewController';
import AudioDriver from './adapter/AudioDriver';
import AuthRepository from './adapter/AuthRepository';
import Channel from './domain/Channel';
import CommandTypeMod from './domain/CommandType';
import ConfigRepository from './adapter/ConfigRepository';
import CookieDriver from './adapter/CookieDriver';
import {DomainState, SelectedTab, CurrentTabType} from './domain/DomainState';
import FooterViewController from './output/view/FooterViewController';
import GeneralSettingViewController from './output/view/GeneralSettingViewController';
import InputBoxViewController from './output/view/InputBoxViewController';
import MainViewController from './output/view/MainViewController';
import MessageActionCreator from './intent/action/MessageActionCreator';
import {MessageGateway} from './adapter/MessageGateway';
import {MessageItem, MessageList} from './output/view/MessageItem';
import Network from './domain/Network';
import NetworkSet from './domain/NetworkSet';
import NotificationActionCreator from './intent/action/NotificationActionCreator';
import NotificationPresenter from './output/NotificationPresenter';
import * as React from 'react';
import * as Rx from 'rx';
import SettingActionCreator from './intent/action/SettingActionCreator';
import SettingStore from './output/viewmodel/SettingStore';
import {SidebarViewController} from './output/view/SidebarViewController';
import {SocketIoDriver} from './adapter/SocketIoDriver';
import {Some, None, Option} from 'option-t';
import {ToggleItem} from './output/view/ToggleItem';
import UIActionCreator from './intent/action/UIActionCreator';
import User from './domain/User';
import WindowPresenter from './output/WindowPresenter';

declare const momoent: any;

const CommandType = CommandTypeMod.type;
const CommandList = CommandTypeMod.list;

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
    const appView = new AppViewController(document.getElementById('viewport'));
    const windows = new MainViewController(globalState, document.getElementById('windows'), cookie, socket);
    const inputBox = new InputBoxViewController(globalState, document.getElementById('js-form'));
    const settings = new GeneralSettingViewController(document.getElementById('settings'), settingStore);
    const sidebarView = new SidebarViewController(globalState, document.getElementById('sidebar'), messageGateway);
    const footer = new FooterViewController(globalState, messageGateway, document.getElementById('footer'));

    var sidebar = $('#sidebar');
    var chat = $('#chat');

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
        var body: JQuery = $('body');
        var login: JQuery = $('#sign-in');
        if (!login.length) {
            AppActionCreator.reload();
            return;
        }
        login.find('.btn').prop('disabled', false);
        var token: string = auth.getToken();
        if (token) {
            auth.removeToken();
            socket.emit('auth', {token: token});
        }
        if (body.hasClass('signed-out')) {
            var error = login.find('.error');
            error.show().closest('form').one('submit', function() {
                error.hide();
            });
        }
        if (!token) {
            body.addClass('signed-out');
        }
        var input: JQuery = login.find('input[name=\'user\']');
        if (input.val() === '') {
            input.val(auth.getUser() || '');
        }
        if (token) {
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
        socket.emit('open', state.id);
    });

    messageGateway.recieveMessage().subscribe(function(data) {
        const channelId = data.channelId;
        var target = '#js-chan-' + channelId;

        const msg = data.message;

        var button = sidebar.find('.chan[data-target="' + target + '"]');
        var isQuery = button.hasClass('query');
        var type = msg.type;
        var highlight = type.indexOf('highlight') !== -1;
        if (highlight || isQuery) {
            if (!document.hasFocus() || !$(target).hasClass('active')) {
                NotificationActionCreator.showNotification(parseInt(target, 10), {
                    from: msg.from,
                    text: msg.text.trim(),
                });
            }
        }
    });

    socket.more().subscribe(function(data) {
        var target = data.chan;
        const view = React.createElement(MessageList, {
            list: data.messages,
        });
        const html = React.renderToStaticMarkup(view);

        var chan = chat
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

    messageGateway.setNickname().subscribe(function (data) {
        const id = data.networkId;
        const nick = data.nickname;
        const network = globalState.networkSet.getById(id);
        network.expect('network should be there').nickname = nick;
        if (globalState.currentTab.channelId.isSome) {
            setNick(nick);
        }
    });

    socket.toggle().subscribe(function(data) {
        var toggle = $('#toggle-' + data.id);
        const view = React.createElement(ToggleItem, {
            item: data,
        });
        const html = React.renderToStaticMarkup(view);
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

    var options = config.get();

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

    UIActionCreator.getDispatcher().toggleLeftPane.subscribe(function (shouldOpen) {
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

    MessageActionCreator.getDispatcher().clearMessage.subscribe(function() {
        chat.find('.active .messages').empty();
        chat.find('.active .show-more').addClass('show');
    });

    MessageActionCreator.getDispatcher().sendCommand.subscribe(function(data){
        socket.emit('input', {
            target: data.channelId,
            text: data.text,
        });
    });

    window.addEventListener('focus', function () {
        var chan = chat.find('.active');
        if (screen.width > 768 && chan.hasClass('chan')) {
            UIActionCreator.focusInputBox();
        }
    });


    const shouldShowLatestInChannel = UIActionCreator.getDispatcher().showLatestInChannel.debounce(100)
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

    var top = 1;
    globalState.getSelectedChannel().subscribe(function(id){
        const target = '#js-chan-' + String(id);
        UIActionCreator.toggleLeftPane(false);
        $('#windows .active').removeClass('active');

        var chan = $(target)
            .addClass('active')
            .css('z-index', top++)
            .find('.chat')
            .end();

        const channel = globalState.networkSet.getChannelById(id);
        const baseTitle = 'karen';
        const title = channel.mapOr(baseTitle, function(channel){
            return channel.name + ' — ' + baseTitle;
        });

        document.title = title;

        const network = channel.map(function(channel){
            return channel.network;
        }).orElse(function() {
            return globalState.networkSet.getById(id);
        });
        if (network.isSome) {
            const nickname = network.unwrap().nickname;
            setNick(nickname);
        }

        if (screen.width > 768 && chan.hasClass('chan')) {
            UIActionCreator.focusInputBox();
        }
    });

    globalState.getSelectedSetting().subscribe(function(id) {
        const target = document.querySelector('#' + id);

        UIActionCreator.toggleLeftPane(false);
        $('#windows .active').removeClass('active');

        var chan = $(target)
            .addClass('active')
            .trigger('show')
            .css('z-index', top++)
            .find('.chat')
            .end();

        var title = 'karen';
        if (chan.data('title')) {
            title = chan.data('title') + ' — ' + title;
        }
        document.title = title;
    });

    AppActionCreator.getDispatcher().signout.subscribe(function(){
        auth.removeToken();
    });

    chat.on('click', '.user', function() {
        var user = $(this).text().trim().replace(/[+%@~&]/, '');
        if (user.indexOf('#') !== -1) {
            return;
        }
        var text = CommandType.WHOIS + ' ' + user;
        socket.emit('input', {
            target: chat.data('id'),
            text: text
        });
    });

    chat.on('click', '.close', function() {
        var id = $(this)
            .closest('.chan')
            .data('id');
        sidebar.find('.chan[data-id=\'' + id + '\']')
            .find('.close')
            .click();
    });

    chat.on('click', '.show-more-button', function() {
        var self = $(this);
        var count = self.parent().next('.messages').children().length;
        socket.emit('more', {
            target: self.data('id'),
            count: count
        });
    });

    chat.on('click', '.toggle-button', function() {
        var self = $(this);
        var chat = self.closest('.chat').get(0);
        var bottom = isScrollBottom(chat);
        var content = self.parent().next('.toggle-content');
        if (bottom && !content.hasClass('show')) {
            var img = content.find('img');
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

    setInterval(function() {
        chat.find('.chan:not(.active)').each(function() {
            var chan = $(this);
            if (chan.find('.messages').children().slice(0, -100).remove().length) {
                chan.find('.show-more').addClass('show');
            }
        });
    }, 1000 * 10);

    function complete(word: string) {
        const words: Array<string> = CommandList.map(function(item){
            return item.toLowerCase();
        });
        const channel: Option<Channel> = globalState.currentTab.channelId.flatMap(function(channelId){
            const channel = globalState.networkSet.getChannelById(channelId);
            return channel;
        });
        const users: Option<Array<User>> = channel.map(function(channel){
            return channel.getUserList();
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
                var order: Array<string> = [];
                sidebar.find('.network').each(function() {
                    var id: string = <any>$(this).data('id');
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
                var order: Array<string> = [];
                var network = ui.item.parent();
                network.find('.chan').each(function() {
                    var id: string = <any>$(this).data('id');
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

    function setNick(nick: string): void {
        var width = $('#js-nick')
            .html(nick + ':')
            .width();
        if (width) {
            width += 31;
            $(inputBox.textInput).css('padding-left', width);
        }
    }
});
