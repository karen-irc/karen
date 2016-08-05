// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {Option} from 'option-t';
import {StatelessComponent} from 'react';

import {MessageActionCreator} from '../../intent/action/MessageActionCreator';
import {UIActionCreator} from '../../intent/action/UIActionCreator';

import {ChannelId} from '../../domain/ChannelDomain';
import {Network} from '../../domain/Network';

interface SidebarNetworkItemProps {
    key?: any;
    network: Network;
    selectedId: Option<ChannelId>;
    notableChannelSet: Set<ChannelId>;
    unreadCountMap: Map<ChannelId, number>;
    msgAction: MessageActionCreator;
    uiAction: UIActionCreator;
}

export const SidebarNetworkItem: StatelessComponent<SidebarNetworkItemProps>;
