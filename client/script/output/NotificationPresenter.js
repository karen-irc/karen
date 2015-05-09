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

import AudioDriver from '../adapter/AudioDriver';
import NotificationActionCreator from '../action/NotificationActionCreator';
import Rx from 'rx';
import UIActionCreator from '../action/UIActionCreator';

const ICON_URL = '/img/logo-64.png';

export default class NotificationPresenter {

    /**
     *  @constructor
     *  @param  {ConfigRepository}  config
     */
    constructor(config) {
        const dispatcher = NotificationActionCreator.getDispatcher();

        /** @type {AudioDriver} */
        this._audio = new AudioDriver('/audio/pop.ogg');

        /** @type {ConfigRepository}  */
        this._config = config;

        /*eslint-disable valid-jsdoc*/
        /** @type {Rx.IDisposable} */
        this._disposePlay = dispatcher.playSound.subscribe(() => {
            this.playSound();
        });

        /** @type {Rx.IDisposable} */
        this._disposeRequestPermission = dispatcher.requestPermission.subscribe(() => {
            this.requestPermission();
        });

        /** @type {Rx.IDisposable} */
        this._disposeshowNotification = dispatcher.showNotification.subscribe((data) => {
            this.showNotification(data.channelId, data.from, data.text);
        });
        /*eslint-enable */
    }

    /**
     *  @returns {void}
     */
    destroy() {
        this._disposePlay.dispose();

        this._audio = null;
        this._disposePlay = null;
    }

    /**
     *  @return {void}
     */
    playSound() {
        this._audio.play();
    }

    /**
     *  @return {void}
     */
    requestPermission() {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }

    /**
     *  @param  {string}  channelId
     *  @param  {string}  from
     *  @param  {string}  text
     *  @return {void}
     */
    showNotification(channelId, from, text) {
        const settings = this._config.get();
        if (settings.notification) {
            // FIXME: should call in `NotificationActionCreator.showNotification()`
            NotificationActionCreator.playSound();
        }

        if (settings.badge && Notification.permission === 'granted') {
            let notification = new Notification(from + ' says:', {
                body: text,
                icon: ICON_URL,
            });

            const timeout = Rx.Observable.empty().delay(5 * 1000);
            const click = Rx.Observable.fromEvent(notification, 'click').take(1).do(function(){
                UIActionCreator.focusWindow();
                UIActionCreator.selectChannel(channelId);
            });

            click.amb(timeout).subscribeOnCompleted(function(){
                notification.close();
                notification = null;
            });
        }
    }
}
