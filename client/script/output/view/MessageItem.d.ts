/// <reference path="../../../../tsd/third_party/react/react.d.ts"/>

import {ComponentClass} from 'react';
import Message from '../../domain/Message';

interface MessageListProps {
    key?: any;
    list: Array<Message>;
}

interface MessageItemProps {
    key?: any;
    message: Message;
}

export var MessageList: ComponentClass<MessageListProps>;
export var MessageItem: ComponentClass<MessageItemProps>;
