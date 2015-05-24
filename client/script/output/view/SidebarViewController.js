/*global Handlebars:true, $: true */
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

import AppActionCreator from '../../intent/action/AppActionCreator';
import UIActionCreator from '../../intent/action/UIActionCreator';

export default class SidebarViewController {

    /**
     *  @constructor
     *  @param  {DomainState}   domain
     *  @param  {Element}   element
     */
    constructor(domain, element) {
        if (!element) {
            throw new Error();
        }

        /** @type   {Element}   */
        this._element = element;

        /*eslint-disable valid-jsdoc */
        /** @type   {Rx.IDisposable}  */
        this._disposeSignout = AppActionCreator.getDispatcher().signout.subscribe(() => {
            this.clearAllNetworks();
            this.showEmptinesse();
        });

        /** @type   {Rx.IDisposable}  */
        this._disposeRenderNetworks = AppActionCreator.getDispatcher().renderNetworksInView.subscribe((networks) => {
            this.hideEmptinesse();
            this.renderNetworks(networks);
        });

        /** @type   {Rx.IDisposable}  */
        this._disposeSelectChannel = UIActionCreator.getDispatcher().selectChannel.subscribe((channelId) => {
            this.selectChannel(channelId);
        });

        /** @type   {Rx.IDisposable}  */
        this._disposeAddedNetwork = domain.networkSet.addedStream().subscribe((network) => {
            this.addNetwork(network);
        });

        /** @type   {Rx.IDisposable}  */
        this._disposeDeletedNetwork = domain.networkSet.deletedStream().subscribe((network) => {
            this.deleteNetwork(network);
        });
        /*eslint-enable */

        element.addEventListener('click', this);
    }

    /**
     *  @param  {Event} aEvent
     *  @return {void}
     */
    handleEvent(aEvent) {
        switch (aEvent.type) {
            case 'click':
                this.onClick(aEvent);
        }
    }

    /**
     *  @param  {Event} aEvent
     *  @return {void}
     */
    onClick(aEvent) {
        const target = aEvent.target;
        if (!target.matches('.js-sidebar-channel, .js-sidebar-channel > :not(.close)')) {
            return;
        }

        // This is very heuristic way.
        let button = target;
        if (!target.classList.contains('js-sidebar-channel')) {
            button = target.parentNode;
        }

        const channelId = parseInt(button.getAttribute('data-id'), 10);
        UIActionCreator.selectChannel(channelId);
    }

    /**
     *  @return {void}
     */
    clearAllNetworks() {
        let element = this._element.querySelector('.networks');
        element.innerHTML = '';
    }

    /**
     *  @param  {Network}   network
     *  @return {void}
     */
    addNetwork(network) {
        this.hideEmptinesse();
        this.appendNetworks([network]);

        const channelList = network.getChannelList();
        const lastId = channelList[channelList.length - 1].id;
        UIActionCreator.selectChannel(lastId);
    }

    /**
     *  @param  {Network}   network
     *  @return {void}
     */
    deleteNetwork(network) {
        const id = network.id;
        const target = this._element.querySelector('#network-' + String(id));
        if (!!target) {
            target.parentNode.removeChild(target);
        }

        const newTarget = this._element.querySelector('.chan');
        if (!newTarget) {
            this.showEmptinesse();
        }
        else {
            const newId = newTarget.getAttribute('data-id');
            UIActionCreator.selectChannel( parseInt(newId, 10) );
        }
    }

    /**
     *  @return {void}
     */
    showEmptinesse() {
        let element = this._element.querySelector('.empty');
        element.style.display = 'block';
    }

    /**
     *  @return {void}
     */
    hideEmptinesse() {
        let element = this._element.querySelector('.empty');
        element.style.display = 'none';
    }

    /**
     *  @param  {Array<Network>} networks
     *  @return {void}
     */
    renderNetworks(networks) {
        const element = this._element.querySelector('.networks');
        const html = Handlebars.templates.network({
            networks,
        });

        element.innerHTML = html;
    }

    /**
     *  @param  {Array<Network>} networks
     *  @return {void}
     */
    appendNetworks(networks) {
        const element = this._element.querySelector('.networks');
        const html = Handlebars.templates.network({
            networks,
        });

        element.innerHTML = element.innerHTML + html;
    }

    /**
     *  @param  {number}    id
     *  @return {void}
     */
    selectChannel(id) {
        const active = this._element.querySelector('.active');
        if (!!active) {
            active.classList.remove('active');
        }

        const selector = '.js-sidebar-channel[data-id="' + String(id) + '"]';
        const target = this._element.querySelector(selector);
        if (!target) {
            return;
        }

        target.classList.add('active');

        const badge = target.querySelector('.badge');
        if (!!badge) {
            badge.classList.remove('highlight');
            // FIXME:
            $(badge).data('count', '');
            badge.textContent = '';
        }
    }
}
