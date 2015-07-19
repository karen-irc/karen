/// <reference path="../../../../tsd/third_party/react/react.d.ts"/>

import {ComponentClass} from 'react';
import Channel from '../../domain/Channel';

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
