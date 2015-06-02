/*global $:true, Handlebars:true, moment: true */

/// <reference path="../../tsd/core-js.d.ts" />
/// <reference path="../../tsd/extends.d.ts" />
/// <reference path="../../node_modules/rx/ts/rx.d.ts" />
/// <reference path="../../node_modules/option-t/option-t.d.ts" />
/// <reference path="../../tsd/thrid_party/jquery/jquery.d.ts" />
/// <reference path="../../tsd/thrid_party/jqueryui/jqueryui.d.ts" />

// babel's `es6.forOf` transform uses `Symbol` and 'Array[Symbol.iterator]'.
import 'core-js/modules/es6.array.iterator';
import 'core-js/es6/symbol';

import arrayFrom from 'core-js/library/fn/array/from';

import AppActionCreator from './intent/action/AppActionCreator';
import AppViewController from './output/view/AppViewController';
import AudioDriver from './adapter/AudioDriver';
import AuthRepository from './adapter/AuthRepository';
import Channel from './model/Channel';
import CommandTypeMod from './model/CommandType';
import ConfigRepository from './adapter/ConfigRepository';
import CookieDriver from './adapter/CookieDriver';
import GeneralSettingViewController from './output/view/GeneralSettingViewController';
import InputBoxViewController from './output/view/InputBoxViewController';
import MainViewController from './output/view/MainViewController';
import MessageActionCreator from './intent/action/MessageActionCreator';
import Network from './model/Network';
import NetworkSet from './model/NetworkSet';
import NotificationActionCreator from './intent/action/NotificationActionCreator';
import NotificationPresenter from './output/NotificationPresenter';
import * as Rx from 'rx';
import SettingActionCreator from './intent/action/SettingActionCreator';
import SettingStore from './store/SettingStore';
import SidebarViewController from './output/view/SidebarViewController';
import SocketIoDriver from './adapter/SocketIoDriver';
import {Some, None, Option} from 'option-t';
import UIActionCreator from './intent/action/UIActionCreator';
import User from './model/User';
import WindowPresenter from './output/WindowPresenter';

declare const Handlebars: any;
declare const momoent: any;

const CommandType = CommandTypeMod.type;
const CommandList = CommandTypeMod.list;

const socket = new SocketIoDriver();
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

// FIXME: This should be go a way.
class SelectedTab {

    type: string;
    id: string|number;

    constructor(type: string, id: string|number) {
        this.type = type;
        this.id = id;
    }

    static get TYPE(): any {
        return {
            SETTING: 'setting',
            CHANNEL: 'channel',
        };
    }

    get channelId(): Option<number> {
        if (this.type === SelectedTab.TYPE.SETTING) {
            return new None<number>();
        }

        const id = parseInt(<any>this.id, 10);
        return new Some<number>(id);
    }
}

class DomainState {

    networkSet: NetworkSet;
    currentTab: SelectedTab;

    constructor() {
        this.networkSet = new NetworkSet([]);
        this.currentTab = null;
    }
}

document.addEventListener('DOMContentLoaded', function onLoad() {
    document.removeEventListener('DOMContentLoaded', onLoad);

    const globalState = new DomainState();
    const appWindow = new WindowPresenter(globalState);
    const appView = new AppViewController(document.getElementById('viewport'));
    const windows = new MainViewController(document.getElementById('windows'), cookie, socket);
    const inputBox = new InputBoxViewController(globalState, document.getElementById('form'));
    const settings = new GeneralSettingViewController(document.getElementById('settings'), settingStore);
    const sidebarView = new SidebarViewController(globalState, document.getElementById('sidebar'));

    var sidebar = $('#sidebar');
    var $footer = $('#footer');
    var chat = $('#chat');

    if (navigator.standalone) {
        document.documentElement.classList.add('web-app-mode');
    }

    $('#footer .icon').tooltip();

    function render(name: string, data: any): string {
        return Handlebars.templates[name](data);
    }

    Handlebars.registerHelper(
        'partial', function(id: string) {
            return new Handlebars.SafeString(render(id, this));
        }
    );

    socket.error().subscribe(function(e: any) {
        /*eslint-disable no-console*/
        console.log(e);
        /*eslint-enable*/
    });

    socket.connectError().subscribe(function(){
        AppActionCreator.reload();
    });

    socket.disconnect().subscribe(function(){
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

        AppActionCreator.showSignIn();
    });

    AppActionCreator.getDispatcher().signout.subscribe(function() {
        $footer.find('.sign-in').click();
    });

    socket.init().subscribe(function(data) {
        if (data.networks.length === 0) {
            UIActionCreator.showConnectSetting();
        } else {
            globalState.networkSet = new NetworkSet(data.networks);

            const networkArray = globalState.networkSet.asArray();
            AppActionCreator.renderNetworksInView(networkArray);

            const channels : Array<Channel> = arrayFlatMap(networkArray, function(network){
                return network.getChannelList();
            });

            chat.html(
                render('chat', {
                    channels: channels
                })
            );
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

    UIActionCreator.getDispatcher().selectChannel.subscribe(function(id){
        globalState.currentTab = new SelectedTab(SelectedTab.TYPE.CHANNEL, id);
    });

    UIActionCreator.getDispatcher().showConnectSetting.subscribe(function(){
        $footer.find('.connect').trigger('click');
    });

    socket.join().subscribe(function(data) {
        const networkId = data.network;
        const network = globalState.networkSet.getById(networkId);
        network.map(function(network) {
            const channel = new Channel(network, data.chan);
            network.addChannel(channel);

            MessageActionCreator.joinChannel(networkId, channel);
        });
    });

    const joinContentRendered = MessageActionCreator.getDispatcher().joinChannel.do(function(data){
        chat.append(
            render('chat', {
                channels: [data.channel]
            })
        );
    });

    // this operation should need to wait both of sidebar & contant rendered.
    Rx.Observable.zip(sidebarView.joinChannelRendered, joinContentRendered, function (s1, s2) {
        return s1;
    }).subscribe(function(id){
        UIActionCreator.selectChannel(id);
    });

    socket.message().subscribe(function(data) {
        var target = '#chan-' + data.chan;
        if (data.msg.type === 'error') {
            target = String(globalState.currentTab.channelId.unwrap());
        }

        var chan: JQuery = chat.find(target);
        var from: string = data.msg.from;

        chan.find('.messages')
            .append(render('msg', {messages: [data.msg]}))
            .trigger('msg', [
                target,
                data.msg
            ]);

        if (!chan.hasClass('channel')) {
            return;
        }

        var type: string = data.msg.type;
        if (type === 'message' || type === 'action') {
            var nicks: Array<User> = chan.find('.users').data('nicks');
            if (nicks) {
                var find = nicks.map(function(i: User): string {
                    return i.nickname;
                }).indexOf(from);
                if (find !== -1 && typeof move === 'function') {
                    move(nicks, find, 0);
                }
            }
        }
    });

    socket.more().subscribe(function(data) {
        var target = data.chan;
        var chan = chat
            .find('#chan-' + target)
            .find('.messages')
            .prepend(render('msg', {messages: data.messages}))
            .end();
        if (data.messages.length !== 100) {
            chan.find('.show-more').removeClass('show');
        }
    });

    socket.network().subscribe(function(data) {
        MessageActionCreator.connectNetwork(data.network);
    });

    MessageActionCreator.getDispatcher().connectNetwork.subscribe(function (data) {
        const network = new Network(data);
        globalState.networkSet.add(network);
    });

    globalState.networkSet.addedStream().subscribe(function (network) {
        const channelList = network.getChannelList();
        chat.append(
            render('chat', {
                channels: channelList,
            })
        );
        $('#connect')
            .find('.btn')
            .prop('disabled', false)
            .end();
        UIActionCreator.setQuitConfirmDialog();

        // Select the first tab of the connected network.
        const id = channelList[0].id;
        UIActionCreator.selectChannel(id);

        sortable();
    });

    socket.nickname().subscribe(function(data) {
        const id = data.network;
        const nickname = data.nick;
        MessageActionCreator.setNickname(id, nickname);
    });

    MessageActionCreator.getDispatcher().setNickname.subscribe(function (data) {
        const id = data.id;
        const nick = data.nickname;
        const network = globalState.networkSet.getById(id);
        network.expect('network should be there').nickname = nick;
        if (globalState.currentTab.channelId.isSome) {
            setNick(nick);
        }
    });

    socket.part().subscribe(function(data) {
        const id = data.chan;
        MessageActionCreator.partFromChannel(id);
    });

    MessageActionCreator.getDispatcher().partFromChannel.subscribe(function(id){
        sidebar.find('.chan[data-id=\'' + id + '\']').remove();
        $('#chan-' + id).remove();

        var next: JQuery = null;
        var highest = -1;
        chat.find('.chan').each(function() {
            var self: JQuery = $(this);
            var z = parseInt(self.css('z-index'), 10);
            if (z > highest) {
                highest = z;
                next = self;
            }
        });

        if (next !== null) {
            let id = next.data('id');
            sidebar.find('[data-id=' + id + ']').click();
        } else {
            sidebar.find('.chan')
                .eq(0)
                .click();
        }
    });

    socket.quit().subscribe(function(data) {
        const id = data.network;
        MessageActionCreator.quitNetwork(id);
    });

    MessageActionCreator.getDispatcher().quitNetwork.subscribe(function(id){
        const n = globalState.networkSet.getById(id);
        n.map(function(network: Network){
            globalState.networkSet.delete(network);
            network.quit();
        });
    });

    socket.toggle().subscribe(function(data) {
        var toggle = $('#toggle-' + data.id);
        toggle.parent().after(render('toggle', {toggle: data}));
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

    socket.topic().subscribe(function(data) {
        MessageActionCreator.setTopic(data.chan, data.topic);
    });

    MessageActionCreator.getDispatcher().setTopic.subscribe(function(data) {
        const channel = document.getElementById('chan-' + data.id);
        const topicElement = channel.querySelector('.header .topic');
        if (!topicElement) {
            return;
        }

        topicElement.textContent = data.topic;
    });

    socket.users().subscribe(function(data) {
        const channelId = data.chan;
        const users = data.users.map(function(element: any){
            return new User(element);
        });
        MessageActionCreator.updateUserList(channelId, users);
    });

    MessageActionCreator.getDispatcher().updateUserList.subscribe(function(data){
        const channel = globalState.networkSet.getChannelById(data.channelId);
        channel.map(function(channel){
            channel.updateUserList(data.list);
        });
    });

    MessageActionCreator.getDispatcher().updateUserList.subscribe(function(data){
        var users = chat.find('#chan-' + data.channelId).find('.users').html(render('user', {
            users: data.list,
        }));
        users.data('nicks', data.list);
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

    document.getElementById('badge').addEventListener('change', function (aEvent) {
        const input = <HTMLInputElement>aEvent.target;
        if (input.checked) {
            NotificationActionCreator.requestPermission();
        }
    });

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
            target: data.targetId,
            text: data.text,
        });
    });

    window.addEventListener('focus', function () {
        var chan = chat.find('.active');
        if (screen.width > 768 && chan.hasClass('chan')) {
            UIActionCreator.focusInputBox();
        }
    });

    UIActionCreator.getDispatcher().selectChannel.subscribe(function(id){
        chat.data('id', id);
        socket.emit('open', id);
    });

    var top = 1;
    UIActionCreator.getDispatcher().selectChannel.subscribe(function(id){
        const target = '#chan-' + String(id);
        UIActionCreator.toggleLeftPane(false);
        $('#windows .active').removeClass('active');

        var chan = $(target)
            .addClass('active')
            .trigger('show')
            .css('z-index', top++)
            .find('.chat')
            .sticky()
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

    UIActionCreator.getDispatcher().selectChannel.subscribe(function(){
        $footer.find('.active').removeClass('active');
    });

    $footer.on('click', '.chan, button', function() {
        var self = $(this);
        var target = self.data('target');
        if (!target) {
            return;
        }
        var id = self.data('id');

        chat.data('id', id);
        socket.emit('open', id);

        $footer.find('.active').removeClass('active');
        self.addClass('active')
            .find('.badge')
            .removeClass('highlight')
            .data('count', '')
            .empty();

        UIActionCreator.toggleLeftPane(false);
        $('#windows .active').removeClass('active');

        var chan = $(target)
            .addClass('active')
            .trigger('show')
            .css('z-index', top++)
            .find('.chat')
            .sticky()
            .end();

        var title = 'karen';
        if (chan.data('title')) {
            title = chan.data('title') + ' — ' + title;
        }
        document.title = title;

        globalState.currentTab = new SelectedTab(SelectedTab.TYPE.SETTING, id);
    });

    $footer.on('click', '#sign-out', function() {
        AppActionCreator.signout();
    });

    AppActionCreator.getDispatcher().signout.subscribe(function(){
        auth.removeToken();
    });

    chat.on('input', '.search', function() {
        var value = $(this).val().toLowerCase();
        var names = $(this).closest('.users').find('.names');
        names.find('button').each(function() {
            var btn = $(this);
            var name = btn.text().toLowerCase().replace(/[+%@~]/, '');
            if (name.indexOf(value) === 0) {
                btn.show();
            } else {
                btn.hide();
            }
        });
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

    chat.on('msg', '.messages', function(e, target, msg) {
        var button = sidebar.find('.chan[data-target=' + target + ']');
        var isQuery = button.hasClass('query');
        var type = msg.type;
        var highlight = type.indexOf('highlight') !== -1;
        if (highlight || isQuery) {
            if (!document.hasFocus() || !$(target).hasClass('active')) {
                NotificationActionCreator.showNotification(target, {
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
            var i = (badge.data('count') || 0) + 1;
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
        var chat = self.closest('.chat');
        var bottom = chat.isScrollBottom();
        var content = self.parent().next('.toggle-content');
        if (bottom && !content.hasClass('show')) {
            var img = content.find('img');
            if (img.length !== 0 && !img.width()) {
                img.on('load', function() {
                    chat.scrollBottom();
                });
            }
        }
        content.toggleClass('show');
        if (bottom) {
            chat.scrollBottom();
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
                    var id = $(this).data('id');
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
                    var id = $(this).data('id');
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
        var width = $('#nick')
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
