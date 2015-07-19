/// <reference path="../../../../tsd/third_party/react/react.d.ts"/>

import {ComponentClass} from 'react';
import Network from '../../domain/Network';

interface NetworkItemListProps {
    key?: any;
    list: Array<Network>,
}

interface NetworkItemProps {
    key?: any;
    network: Network,
}

export var NetworkItemList: ComponentClass<NetworkItemListProps>;
export var NetworkItem: ComponentClass<NetworkItemProps>;
