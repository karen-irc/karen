/// <reference path="../../../../tsd/third_party/react/react.d.ts"/>

import {ComponentClass} from 'react';
import Channel from '../../domain/Channel';

interface ChannelItemProps {
    key?: any;
    channel: Channel;
}

export var ChannelItem: ComponentClass<ChannelItemProps>;
