/// <reference path="../../../../tsd/third_party/react/react.d.ts"/>

import {ComponentClass} from 'react';
import User from '../../domain/User';

interface UserListProps {
    key?: any;
    list: Array<User>;
}

export var UserList: ComponentClass<UserListProps>;
