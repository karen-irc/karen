/// <reference path="../../../../tsd/third_party/react/react.d.ts"/>

import {ComponentClass} from 'react';
import Message from '../../domain/Message';

interface MessageItemProps {
    key?: any;
    message: Message;
}

export var MessageItem: ComponentClass<MessageItemProps>;
