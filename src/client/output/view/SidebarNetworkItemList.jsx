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

import {OptionBase} from 'option-t';
import * as React from 'react';
import * as PropTypes from 'prop-types';

import {MessageActionCreator} from '../../intent/action/MessageActionCreator';
import {UIActionCreator} from '../../intent/action/UIActionCreator';

import {SidebarChannelItem} from './SidebarChannelItem';
import {Network} from '../../domain/Network';

export function SidebarNetworkItem(props) {
    const network = props.network;
    const selectedId = props.selectedId;
    const notableChannelSet = props.notableChannelSet;
    const unreadCountMap = props.unreadCountMap;
    const msgAction = props.msgAction;
    const uiAction = props.uiAction;

    const channels = network.getChannelList().map(function(channel){
        const channelId = channel.id;
        const isSelected = selectedId.mapOr(false, function (id) {
            const isSelected = (channelId === id);
            return isSelected;
        });
        const isNotable = notableChannelSet.has(channelId);
        const unreadCount = unreadCountMap.get(channelId);
        //XXX: `unreadCount === undefined` handling should be fixed in view model layer.
        return (
            <SidebarChannelItem key={String(channelId)}
                                channel={channel}
                                isSelected={isSelected}
                                isNotable={isNotable}
                                unreadCount={(unreadCount === undefined) ? 0 : unreadCount}
                                msgAction={msgAction}
                                uiAction={uiAction}/>
        );
    });

    return (
        <section className='network'>
            {channels}
        </section>
    );
}
SidebarNetworkItem.propTypes = {
    network: PropTypes.instanceOf(Network).isRequired,
    selectedId: PropTypes.instanceOf(OptionBase).isRequired,
    notableChannelSet: PropTypes.instanceOf(Set).isRequired,
    unreadCountMap: PropTypes.instanceOf(Map).isRequired,
    msgAction: PropTypes.instanceOf(MessageActionCreator).isRequired,
    uiAction: PropTypes.instanceOf(UIActionCreator).isRequired,
};
