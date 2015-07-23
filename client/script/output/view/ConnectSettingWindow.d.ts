/// <reference path="../../../../tsd/third_party/react/react.d.ts"/>

import {ComponentClass} from 'react';

import {ConnectionActionCreator} from '../../intent/action/ConnectionActionCreator';
import {ConnectionValue} from '../../domain/value/ConnectionSettings';

export var ConnectSettingWindow: ComponentClass<{
    key?: any;
    action: ConnectionActionCreator;
    data: ConnectionValue;
}>;
