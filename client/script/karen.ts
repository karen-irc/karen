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
import {ChatWindowItem, ChatWindowList} from './output/view/ChatWindowItem';
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
import SidebarViewController from './output/view/SidebarViewController';
import {SocketIoDriver} from './adapter/SocketIoDriver';
import {Some, None, Option} from 'option-t';
import {ToggleItem} from './output/view/ToggleItem';
import UIActionCreator from './intent/action/UIActionCreator';
import User from './domain/User';
import {UserList} from './output/view/UserList';
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

function arrayFlatMap<T, U>(target: Array<T>, fn: {(value: T): Array<U>}) : Array<U> {
    return target.reduce(function (result : Array<U>, element : T) {
        const mapped : Array<U> = fn(element);
        return result.concat(mapped);
    }, []);
}

document.addEventListener('DOMContentLoaded', function onLoad() {
    document.removeEventListener('DOMContentLoaded', onLoad);

    const globalState = new DomainState(messageGateway);
    const appWindow = new WindowPresenter(globalState);
    const appView = new AppViewController(document.getElementById('viewport'));
    const windows = new MainViewController(document.getElementById('windows'), cookie, socket);
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

    messageGateway.invokeInit().subscribe(function(data) {
        if (data.networks.length !== 0) {
            globalState.networkSet = new NetworkSet(data.networks);

            const networkArray = globalState.networkSet.asArray();
            AppActionCreator.renderNetworksInView(networkArray);

            const channels : Array<Channel> = arrayFlatMap(networkArray, function(network){
                return network.getChannelList();
            });

            const view = React.createElement(ChatWindowList, {
                list: channels,
            });
            const html = React.renderToStaticMarkup(view);
            chat.html(html);

            // TODO: Seek the better way to update users list when initializing the karen.
            channels.forEach((channel: Channel) => {
                const users : Array<User> = channel.getUserList();
                MessageActionCreator.updateUserList(channel.id, users);
            });

            UIActionCreator.setQuitConfirmDialog();
        }

        if (data.token) {
            auth.setToken(data.token);
        }

        $('body').removeClass('signed-out');
        $('#sign-in').detach();

        var id = data.active;
        if (globalState.currentTab === null || typeof id !== 'number' || id === -1) {
            UIActionCreator.showConnectSetting();
        }
        else {
            UIActionCreator.selectChannel(id);
        }

        sortable();
    });

    globalState.getCurrentTab().subscribe(function(state){
        chat.data('id', state.id);
        socket.emit('open', state.id);
    });

    messageGateway.joinChannel().subscribe(function({networkId, channel}){
        const network = globalState.networkSet.getById(networkId);
        network.map(function(network) {
            channel.bindToNetwork(network);
            network.addChannel(channel);

            MessageActionCreator.joinChannel(networkId, channel);
        });
    });

    MessageActionCreator.getDispatcher().joinChannel.subscribe(function(data){
        const view = React.createElement(ChatWindowItem, {
            channel: data.channel,
        });
        const html = React.renderToStaticMarkup(view);
        chat.append(html);
        UIActionCreator.showLatestInChannel(data.channel.id);
    })

    const messageRenderedSubject = new Rx.Subject<{ target: string; message: any; }>();

    messageGateway.recieveMessage().subscribe(function(data) {
        const channelId = data.channelId;
        var target = '#js-chan-' + channelId;
        if (data.message.type === 'error') {
            target = String(globalState.currentTab.channelId.unwrap());
        }

        var chan: JQuery = chat.find(target);
        var from: string = data.message.from;

        const channelBox = chan.find('.chat').get(0);
        const shouldBottom = channelBox && isScrollBottom(channelBox);

        const view = React.createElement(MessageItem, {
            message: data.message,
        });
        const html = React.renderToStaticMarkup(view);

        chan.find('.messages').append(html);

        if (shouldBottom) {
            UIActionCreator.showLatestInChannel(channelId);
        }

        messageRenderedSubject.onNext({
            target: target,
            message: data.message,
        });

        if (!chan.hasClass('channel')) {
            return;
        }

        var type: string = data.message.type;
        if (type === 'message' || type === 'action') {
            const channel = globalState.networkSet.getChannelById(channelId);
            const nicks: Option<Array<User>> = channel.map(function(channel){
                return channel.getUserList();
            });

            if (nicks.isSome) {
                var find = nicks.unwrap().map(function(i: User): string {
                    return i.nickname;
                }).indexOf(from);
                if (find !== -1 && typeof move === 'function') {
                    move(nicks.unwrap(), find, 0);
                }
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

    messageGateway.addNetwork().subscribe(function(network) {
        globalState.networkSet.add(network);
    });

    globalState.networkSet.addedStream().subscribe(function (network) {
        const channelList = network.getChannelList();

        const view = React.createElement(ChatWindowList, {
            list: channelList,
        });
        const html = React.renderToStaticMarkup(view);
        chat.append(html);

        UIActionCreator.setQuitConfirmDialog();

        // Select the first tab of the connected network.
        const id = channelList[0].id;
        UIActionCreator.selectChannel(id);

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

    messageGateway.partFromChannel().subscribe(function(id){
        $('#js-chan-' + id).remove();
        var highest = -1;
        chat.find('.chan').each(function() {
            var self: JQuery = $(this);
            var z = parseInt(self.css('z-index'), 10);
            if (z > highest) {
                highest = z;
            }
        });
    });

    messageGateway.quitNetwork().subscribe(function(id){
        const n = globalState.networkSet.getById(id);
        n.map(function(network: Network){
            globalState.networkSet.delete(network);
            network.quit();
        });
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

    messageGateway.setTopic().subscribe(function(data) {
        const channel = document.getElementById('js-chan-' + data.channelId);
        const topicElement = channel.querySelector('.js-topic');
        if (!topicElement) {
            return;
        }

        topicElement.textContent = data.topic;
    });

    messageGateway.updateUserList().subscribe(function(data){
        const channel = globalState.networkSet.getChannelById(data.channelId);
        channel.map(function(channel){
            channel.updateUserList(data.list);
        });
    });

    messageGateway.updateUserList().subscribe(function(data){
        const node = chat.find('#js-chan-' + data.channelId).find('.js-users').get(0);
        const view = React.createElement(UserList, {
            list: data.list,
        });
        React.render(view, node);
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

    messageRenderedSubject.asObservable().subscribe(function(data){
        const target = data.target;
        const msg = data.message;

        var button = sidebar.find('.chan[data-target=' + target + ']');
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

        button = button.filter(':not(.active)');
        if (button.length === 0) {
            return;
        }

        var ignore = [
            'join',
            'part',
            'quit',
            'nick',
            'mode',
        ];
        if ($.inArray(type, ignore) !== -1){
            return;
        }

        var badge = button.find('.badge');
        if (badge.length !== 0) {
            var i = (<any>badge.data('count') || 0) + 1;
            badge.data('count', i);
            badge.html(i > 999 ? (i / 1000).toFixed(1) + 'k' : i);
            if (highlight || isQuery) {
                badge.addClass('highlight');
            }
        }
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

    function move(array: Array<User>, oldIndex: number, newIndex: number) {
        if (newIndex >= array.length) {
            var k = newIndex - array.length;
            while ((k--) + 1) {
                this.push(undefined);
            }
        }
        array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
        return array;
    }
});
