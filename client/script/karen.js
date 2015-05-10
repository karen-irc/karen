/*global $:true, Handlebars:true, moment: true */

// babel's `es6.forOf` transform uses `Symbol` and 'Array[Symbol.iterator]'.
import 'core-js/modules/es6.array.iterator';
import 'core-js/es6/symbol';

import AppActionCreator from './intent/action/AppActionCreator';
import AppViewController from './output/view/AppViewController';
import AudioDriver from './adapter/AudioDriver';
import AuthRepository from './adapter/AuthRepository';
import CommandTypeMod from './model/CommandType';
import ConfigRepository from './adapter/ConfigRepository';
import CookieDriver from './adapter/CookieDriver';
import GeneralSettingViewController from './output/view/GeneralSettingViewController';
import InputBoxViewController from './output/view/InputBoxViewController';
import MainViewController from './output/view/MainViewController';
import MessageActionCreator from './intent/action/MessageActionCreator';
import Mousetrap from 'mousetrap';
import Network from './model/Network';
import NotificationActionCreator from './intent/action/NotificationActionCreator';
import NotificationPresenter from './output/NotificationPresenter';
import SettingActionCreator from './intent/action/SettingActionCreator';
import SettingStore from './store/SettingStore';
import SidebarViewController from './output/view/SidebarViewController';
import SocketIoDriver from './adapter/SocketIoDriver';
import UIActionCreator from './intent/action/UIActionCreator';
import WindowPresenter from './output/WindowPresenter';

const CommandType = CommandTypeMod.type;
const CommandList = CommandTypeMod.list;

const socket = new SocketIoDriver();
const cookie = new CookieDriver();
const config = new ConfigRepository(cookie);
const notify = new NotificationPresenter(config);
const auth = new AuthRepository(cookie);

const settingStore = new SettingStore(config);

document.addEventListener('DOMContentLoaded', function onLoad() {
    document.removeEventListener('DOMContentLoaded', onLoad);

    const appWindow = new WindowPresenter();
    const appView = new AppViewController(document.getElementById('viewport'));
    const windows = new MainViewController(document.getElementById('windows'), cookie, socket);
    const inputBox = new InputBoxViewController(document.getElementById('form'));
    const settings = new GeneralSettingViewController(document.getElementById('settings'), settingStore);
    const sidebarView = new SidebarViewController(document.getElementById('sidebar'));

    const networkSet = new Set();

    var sidebar = $('#sidebar');
    var $footer = $('#footer');
    var chat = $('#chat');

    if (navigator.standalone) {
        document.documentElement.classList.add('web-app-mode');
    }

    $('#footer .icon').tooltip();

    function render(name, data) {
        return Handlebars.templates[name](data);
    }

    Handlebars.registerHelper(
        'partial', function(id) {
            return new Handlebars.SafeString(render(id, this));
        }
    );

    socket.error().subscribe(function(e) {
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

    socket.auth().subscribe(function(data) {
        var body = $('body');
        var login = $('#sign-in');
        if (!login.length) {
            AppActionCreator.reload();
            return;
        }
        login.find('.btn').prop('disabled', false);
        var token = auth.getToken();
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
        var input = login.find('input[name=\'user\']');
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
            data.networks.forEach(function(n){
                const network = new Network(n);
                networkSet.add(network);
            });

            AppActionCreator.renderNetworksInView(data);

            var channels = $.map(data.networks, function(n) {
                return n.channels;
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
        UIActionCreator.selectChannel(String(id));

        sortable();
    });

    UIActionCreator.getDispatcher().showConnectSetting.subscribe(function(){
        $footer.find('.connect').trigger('click');
    });

    socket.join().subscribe(function(data) {
        var id = data.network;
        var network = sidebar.find('#network-' + id);
        network.append(
            render('chan', {
                channels: [data.chan]
            })
        );
        chat.append(
            render('chat', {
                channels: [data.chan]
            })
        );
        var chan = sidebar.find('.chan')
            .sort(function(a, b) { return $(a).data('id') - $(b).data('id'); })
            .last();
        if (!whois) {
            chan = chan.filter(':not(.query)');
        }
        whois = false;
        chan.click();
    });

    socket.message().subscribe(function(data) {
        var target = '#chan-' + data.chan;
        if (data.msg.type === 'error') {
            target = '#chan-' + chat.find('.active').data('id');
        }

        var chan = chat.find(target);
        var from = data.msg.from;

        chan.find('.messages')
            .append(render('msg', {messages: [data.msg]}))
            .trigger('msg', [
                target,
                data.msg
            ]);

        if (!chan.hasClass('channel')) {
            return;
        }

        var type = data.msg.type;
        if (type === 'message' || type === 'action') {
            var nicks = chan.find('.users').data('nicks');
            if (nicks) {
                var find = nicks.indexOf(from);
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

    MessageActionCreator.getDispatcher().connectNetwork.subscribe(function (network) {
        sidebar.find('.empty').hide();
        sidebar.find('.networks').append(
            render('network', {
                networks: [network]
            })
        );
        chat.append(
            render('chat', {
                channels: network.channels
            })
        );
        sidebar.find('.chan')
            .last()
            .trigger('click');
        $('#connect')
            .find('.btn')
            .prop('disabled', false)
            .end();
        UIActionCreator.setQuitConfirmDialog();
        sortable();
    });

    socket.nickname().subscribe(function(data) {
        const id = data.network;
        const nickname = data.nick;
        MessageActionCreator.setNickname(id, nickname);
    });

    MessageActionCreator.getDispatcher().setNickname.subscribe(function (data) {
        const id = data.network;
        const nick = data.nick;
        const network = sidebar.find('#network-' + id).data('nick', nick);
        if (network.find('.active').length !== 0) {
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

        var next = null;
        var highest = -1;
        chat.find('.chan').each(function() {
            var self = $(this);
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
        sidebar.find('#network-' + id)
            .remove()
            .end();
        var chan = sidebar.find('.chan')
            .eq(0)
            .trigger('click');
        if (chan.length === 0) {
            sidebar.find('.empty').show();
        }
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
        var users = chat.find('#chan-' + data.chan).find('.users').html(render('user', data));
        var nicks = [];
        for (var i in data.users) {
            nicks.push(data.users[i].name);
        }
        users.data('nicks', nicks);
    });

    var options = config.get();

    settingStore.subscribe(function (option) {
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
    });

    document.getElementById('badge').addEventListener('change', function (aEvent) {
        const input = aEvent.target;
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

    inputBox.queryCurrentChannel.subscribe(function(subject){
        const id = chat.data('id');
        subject.onNext(id);
        subject.onCompleted();
    });

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

    var top = 1;
    sidebar.on('click', '.chan, button', function() {
        var self = $(this);
        var target = self.data('target');
        if (!target) {
            return;
        }

        chat.data(
            'id',
            self.data('id')
        );
        socket.emit(
            'open',
            self.data('id')
        );

        sidebar.find('.active').removeClass('active');
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

        if (self.hasClass('chan')) {
            var nick = self
                .closest('.network')
                .data('nick');
            if (nick) {
                setNick(nick);
            }
        }

        if (screen.width > 768 && chan.hasClass('chan')) {
            UIActionCreator.focusInputBox();
        }
    });

    $footer.on('click', '.chan, button', function() {
        var self = $(this);
        var target = self.data('target');
        if (!target) {
            return;
        }

        chat.data(
            'id',
            self.data('id')
        );
        socket.emit(
            'open',
            self.data('id')
        );

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
    });

    $footer.on('click', '#sign-out', function() {
        MessageActionCreator.signout();
    });

    AppActionCreator.getDispatcher().signout.subscribe(function(){
        auth.removeToken();
    });

    sidebar.on('click', '.close', function() {
        var cmd = CommandType.CLOSE;
        var chan = $(this).closest('.chan');
        if (chan.hasClass('lobby')) {
            cmd = CommandType.QUIT;
            var server = chan.find('.name').html();
            /*eslint-disable no-alert*/
            if (!window.confirm('Disconnect from ' + server + '?')) {
                return false;
            }
            /*eslint-enable*/
        }
        socket.emit('input', {
            target: chan.data('id'),
            text: cmd
        });
        chan.css({
            transition: 'none',
            opacity: 0.4
        });
        return false;
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

    var whois = false;
    chat.on('click', '.user', function() {
        var user = $(this).text().trim().replace(/[+%@~&]/, '');
        if (user.indexOf('#') !== -1) {
            return;
        }
        whois = true;
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

    Mousetrap.bind([
        'command+up',
        'command+down',
        'ctrl+up',
        'ctrl+down'
    ], function(e, keys) {
        var channels = sidebar.find('.chan');
        var index = channels.index(channels.filter('.active'));
        var direction = keys.split('+').pop();
        switch (direction) {
        case 'up':
            // Loop
            var upTarget = (channels.length + (index - 1 + channels.length)) % channels.length;
            channels.eq(upTarget).click();
            break;

        case 'down':
            // Loop
            var downTarget = (channels.length + (index + 1 + channels.length)) % channels.length;
            channels.eq(downTarget).click();
            break;
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

    function complete(word) {
        const words = CommandList.map(function(item){
            return item.toLowerCase();
        });
        var users = chat.find('.active').find('.users');
        var nicks = users.data('nicks');

        if (!nicks) {
            nicks = [];
            users.find('.user').each(function(i, element) {
                var nick = element.textContent.replace(/[~&@%+]/, '');
                nicks.push(nick);
            });
            users.data('nicks', nicks);
        }

        for (let n of nicks) {
            words.push(n.toLowerCase());
        }

        var channels = sidebar.find('.chan')
            .each(function(i, element) {
                if (!element.classList.contains('lobby')) {
                    words.push($(element).data('title').toLowerCase());
                }
            });

        return words.filter(function(word, item){
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
                var order = [];
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
                var order = [];
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

    function setNick(nick) {
        var width = $('#nick')
            .html(nick + ':')
            .width();
        if (width) {
            width += 31;
            $(inputBox.textInput).css('padding-left', width);
        }
    }

    function move(array, oldIndex, newIndex) {
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
