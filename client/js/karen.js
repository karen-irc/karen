/*global $:true, Handlebars:true, moment: true */

import 'babelify/polyfill';
import AppViewController from '../script/output/view/AppViewController';
import AudioDriver from '../script/adopter/AudioDriver';
import AuthRepository from '../script/adopter/AuthRepository';
import CommandTypeMod from '../script/model/CommandType';
import ConfigRepository from '../script/adopter/ConfigRepository';
import CookieDriver from '../script/adopter/CookieDriver';
import MainViewController from '../script/output/view/MainViewController';
import MessageActionCreator from '../script/action/MessageActionCreator';
import Mousetrap from 'mousetrap';
import NotificationActionCreator from '../script/action/NotificationActionCreator';
import NotificationPresenter from '../script/output/NotificationPresenter';
import SocketIoDriver from '../script/adopter/SocketIoDriver';
import UIActionCreator from '../script/action/UIActionCreator';

const CommandType = CommandTypeMod.type;
const CommandList = CommandTypeMod.list;

const socket = new SocketIoDriver();
const cookie = new CookieDriver();
const config = new ConfigRepository(cookie);
const notify = new NotificationPresenter();
const auth = new AuthRepository(cookie);

document.addEventListener('DOMContentLoaded', function onLoad() {
    document.removeEventListener('DOMContentLoaded', onLoad);

    const appView = new AppViewController(document.getElementById('viewport'));
    const windows = new MainViewController(document.getElementById('windows'), cookie, socket);

    var sidebar = $('#sidebar, #footer');
    var chat = $('#chat');

    if (navigator.standalone) {
        document.documentElement.classList.add('web-app-mode');
    }

    document.getElementById('play').addEventListener('click', function () {
        NotificationActionCreator.playSound();
    });

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
        refresh();
    });

    socket.disconnect().subscribe(function(){
        refresh();
    });

    socket.auth().subscribe(function(data) {
        var body = $('body');
        var login = $('#sign-in');
        if (!login.length) {
            refresh();
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
        sidebar.find('.sign-in')
            .click()
            .end()
            .find('.networks')
            .html('')
            .next()
            .show();
    });

    socket.init().subscribe(function(data) {
        if (data.networks.length === 0) {
            $('#footer').find('.connect').trigger('click');
        } else {
            sidebar.find('.empty').hide();
            sidebar.find('.networks').html(
                render('network', {
                    networks: data.networks
                })
            );
            var channels = $.map(data.networks, function(n) {
                return n.channels;
            });
            chat.html(
                render('chat', {
                    channels: channels
                })
            );
            confirmExit();
        }

        if (data.token) {
            auth.setToken(data.token);
        }

        $('body').removeClass('signed-out');
        $('#sign-in').detach();

        var id = data.active;
        var target = sidebar.find('[data-id=\'' + id + '\']').trigger('click');
        if (target.length === 0) {
            var first = sidebar.find('.chan')
                .eq(0)
                .trigger('click');
            if (first.length === 0) {
                $('#footer').find('.connect').trigger('click');
            }
        }

        sortable();
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
        sidebar.find('.empty').hide();
        sidebar.find('.networks').append(
            render('network', {
                networks: [data.network]
            })
        );
        chat.append(
            render('chat', {
                channels: data.network.channels
            })
        );
        sidebar.find('.chan')
            .last()
            .trigger('click');
        $('#connect')
            .find('.btn')
            .prop('disabled', false)
            .end();
        confirmExit();
        sortable();
    });

    socket.nickname().subscribe(function(data) {
        var id = data.network;
        var nick = data.nick;
        var network = sidebar.find('#network-' + id).data('nick', nick);
        if (network.find('.active').length) {
            setNick(nick);
        }
    });

    socket.part().subscribe(function(data) {
        var id = data.chan;
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
            id = next.data('id');
            sidebar.find('[data-id=' + id + ']').click();
        } else {
            sidebar.find('.chan')
                .eq(0)
                .click();
        }
    });

    socket.quit().subscribe(function(data) {
        var id = data.network;
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
        // .text() escapes HTML (but not quotes)
        $('#chan-' + data.chan).find('.header .topic').text(data.topic);
    });

    socket.users().subscribe(function(data) {
        var users = chat.find('#chan-' + data.chan).find('.users').html(render('user', data));
        var nicks = [];
        for (var i in data.users) {
            nicks.push(data.users[i].name);
        }
        users.data('nicks', nicks);
    });

    var settings = $('#settings');
    var options = config.get();

    for (var i in options) {
        if (options[i]) {
            settings.find('input[name=' + i + ']').prop('checked', true);
        }
    }

    settings.on('change', 'input', function() {
        var self = $(this);
        var name = self.attr('name');
        options[name] = self.prop('checked');
        config.set(options);

        if ([
            'join',
            'mode',
            'motd',
            'nick',
            'part',
            'quit',
        ].indexOf(name) !== -1) {
            chat.toggleClass('hide-' + name, !self.prop('checked'));
        }
        if (name === 'colors') {
            chat.toggleClass('no-colors', !self.prop('checked'));
        }
    }).find('input')
        .trigger('change');

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

    var input = document.getElementById('input');
    $(input).history()
            .tab(complete, {hint: false});

    document.getElementById('form').addEventListener('submit', function (aEvent) {
        aEvent.preventDefault();

        const text = input.value;
        var id = chat.data('id');
        MessageActionCreator.inputCommand(id, text);

        input.value = '';
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

    UIActionCreator.getDispatcher().focusWindow.subscribe(function(){
        window.focus();
    });

    UIActionCreator.getDispatcher().focusInputBox.subscribe(function () {
        input.focus();
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
        socket.getSocket().emit(
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

    sidebar.on('click', '#sign-out', function() {
        auth.removeToken();
        location.reload();
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
        socket.getSocket().emit('input', {
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
        socket.getSocket().emit('input', {
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
                var settings = config.get();
                if (settings.notification) {
                    NotificationActionCreator.playSound();
                }
                if (settings.badge && Notification.permission === 'granted') {
                    var notify = new Notification(msg.from + ' says:', {
                        body: msg.text.trim(),
                        icon: '/img/logo-64.png'
                    });
                    notify.onclick = function() {
                        UIActionCreator.focusWindow();
                        button.click();
                        this.close();
                    };
                    window.setTimeout(function() {
                        notify.close();
                    }, 5 * 1000);
                }
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
        socket.getSocket().emit('more', {
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

    Mousetrap.bind([
        'command+k',
        'ctrl+l',
        'ctrl+shift+l'
    ], function (e) {
        if(e.target === input) {
            MessageActionCreator.clear();
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

    function confirmExit() {
        if ($('body').hasClass('public')) {
            window.onbeforeunload = function() {
                return 'Are you sure you want to navigate away from this page?';
            };
        }
    }

    function refresh() {
        window.onbeforeunload = null;
        location.reload();
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
                socket.getSocket().emit(
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
                socket.getSocket().emit(
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
            $(input).css('padding-left', width);
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
