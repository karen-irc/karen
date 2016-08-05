// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {ComponentClass} from 'react';

import {MessageActionCreator} from '../../intent/action/MessageActionCreator';

import {ChannelId} from '../../domain/ChannelDomain';
import {User} from '../../domain/User';

interface UserListProps {
    key?: any;
    channelId: ChannelId;
    list: Array<User>;
    action: MessageActionCreator;
}

export var UserList: ComponentClass<UserListProps>;
