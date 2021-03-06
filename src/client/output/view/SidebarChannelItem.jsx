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

import * as React from 'react';
import * as PropTypes from 'prop-types';

import {Channel} from '../../domain/Channel';
import {CommandType} from '../../domain/CommandType';

import {MessageActionCreator} from '../../intent/action/MessageActionCreator';
import {UIActionCreator} from '../../intent/action/UIActionCreator';

export class SidebarChannelItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isClosing: false,
        };

        this.onClickSelect = this.onClickSelect.bind(this);
        this.onClickClose = this.onClickClose.bind(this);
    }

    render() {
        const props = this.props;
        const channel = props.channel;
        const isSelected = props.isSelected;
        const id = String(channel.id);
        const isNotable = props.isNotable && !isSelected;
        const unreadCount = props.unreadCount;
        let unreadLabel = '';
        if (!isSelected && unreadCount > 0) {
            unreadLabel = (unreadCount > 999) ?
                (unreadCount / 1000).toFixed(1) + 'k' :
                String(unreadCount);
        }

        const isClosing = this.state.isClosing;

        return (
            <div data-id={id}
                data-target={'#js-chan-' + id}
                data-title={channel.name}
                className={'js-sidebar-channel chan ' + channel.type + (isSelected ? ' active' : '') + (isClosing ? ' js-closing' : '')}
                onClick={this.onClickSelect}>
                <span className={'badge' + (isNotable ? ' highlight' : '')}
                    data-count={String(unreadCount)}>
                    {unreadLabel}
                </span>
                <span className='close' onClick={this.onClickClose}></span>
                <span className='name'>{channel.name}</span>
            </div>
        );
    }

    onClickSelect(event) {
        event.preventDefault();

        const channel = this.props.channel;
        const channelId = channel.id;
        this.props.uiAction.selectChannel(channelId);
    }

    // FIXME: this part should be in a domain logic layer.
    onClickClose(event) {
        event.preventDefault();
        event.stopPropagation();

        const channel = this.props.channel;
        const channelType = channel.type;
        const isLobby = (channelType === 'lobby');
        const command = isLobby ? CommandType.QUIT : CommandType.CLOSE;
        if (isLobby) {
            /*eslint-disable no-alert*/
            if (!window.confirm('Disconnect from ' + channel.name + '?')) {
                return;
            }
            /*eslint-enable*/
        }
        this.props.msgAction.inputCommand(channel.id, command);

        this.setState({
            isClosing: true,
        });
    }
}
SidebarChannelItem.propTypes = {
    channel: PropTypes.instanceOf(Channel).isRequired,
    isSelected: PropTypes.bool.isRequired,
    isNotable: PropTypes.bool.isRequired,
    unreadCount: PropTypes.number.isRequired,
    msgAction: PropTypes.instanceOf(MessageActionCreator).isRequired,
    uiAction: PropTypes.instanceOf(UIActionCreator).isRequired,
};
