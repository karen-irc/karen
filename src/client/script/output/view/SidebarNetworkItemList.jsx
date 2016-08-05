// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {OptionBase} from 'option-t';
import * as React from 'react';

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
    network: React.PropTypes.instanceOf(Network).isRequired,
    selectedId: React.PropTypes.instanceOf(OptionBase).isRequired,
    notableChannelSet: React.PropTypes.instanceOf(Set).isRequired,
    unreadCountMap: React.PropTypes.instanceOf(Map).isRequired,
    msgAction: React.PropTypes.instanceOf(MessageActionCreator).isRequired,
    uiAction: React.PropTypes.instanceOf(UIActionCreator).isRequired,
};
