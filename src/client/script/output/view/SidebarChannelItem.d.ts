// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {ComponentClass} from 'react';
import {Channel} from '../../domain/Channel';

import {MessageActionCreator} from '../../intent/action/MessageActionCreator';
import {UIActionCreator} from '../../intent/action/UIActionCreator';

interface SidebarChannelItemProps {
    key?: any;
    channel: Channel;
    isSelected: boolean;
    isNotable: boolean;
    msgAction: MessageActionCreator;
    uiAction: UIActionCreator;
}

export const SidebarChannelItem: ComponentClass<SidebarChannelItemProps>;
