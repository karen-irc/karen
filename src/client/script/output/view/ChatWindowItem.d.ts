// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {ComponentClass} from 'react';
import {Channel} from '../../domain/Channel';

interface ChatWindowListProps {
    key?: any;
    list: Array<Channel>;
}

interface ChatWindowItemProps {
    key?: any;
    channel: Channel;
}

export var ChatWindowList: ComponentClass<ChatWindowListProps>;
export var ChatWindowItem: ComponentClass<ChatWindowItemProps>;
