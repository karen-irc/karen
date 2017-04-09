/**
 * @license MIT License
 *
 * Copyright (c) 2015 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import * as React from 'react';
import * as PropTypes from 'prop-types';
import {User} from '../../domain/User';

import {MessageActionCreator} from '../../intent/action/MessageActionCreator';

function lookupModeClassName(mode) {
    switch (mode) {
        case '~':
            return 'owner';

        case '&':
            return 'admin';

        case '@':
            return 'op';

        case '%':
            return 'half-op';

        case '+':
            return 'voice';

        default:
            return 'normal';
    }
}

export class UserList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            searchText: '',
        };

        this.onChangeSearch = this.onChangeSearch.bind(this);
    }

    render() {
        const users = this.props.list;

        let count = null;
        if (users.length > 0) {
            const placeholder = (users.length === 1) ? 'user' : 'users';
            count = (
                <div className='count'>
                    <input className='search'
                           onChange={this.onChangeSearch}
                           value={this.state.searchText}
                           placeholder={placeholder}/>
                </div>
            );
        }

        const modeMap = Object.create(null);
        users.forEach((user) => {
            let mode = modeMap[user.mode];
            if (mode === undefined) {
                mode = [];
                modeMap[user.mode] = mode;
            }

            // XXX: This operation should be in view model layer.
            if (user.name.indexOf(this.state.searchText) >= 0) {
                mode.push(user);
            }
        });

        const action = this.props.action;
        const channelId = this.props.channelId;
        const list = Object.keys(modeMap).map(function(key) {
            const userList = modeMap[key];
            return <UserGroup key={key} mode={key} list={userList} channelId={channelId} action={action}/>;
        });

        return (
            <div>
                {count}
                <div className='names'>
                    <div className='inner'>
                        {list}
                    </div>
                </div>
            </div>
        );
    }

    onChangeSearch(event) {
        const value = event.target.value;
        this.setState({
            searchText: value,
        });
    }
}
UserList.propTypes = {
    channelId: PropTypes.number.isRequired,
    list: PropTypes.arrayOf(PropTypes.instanceOf(User)).isRequired,
    action: PropTypes.instanceOf(MessageActionCreator).isRequired,
};

function UserGroup({ channelId, mode, list, action }) {
    const domlist = list.map(function(item){
        return <UserItem key={item.name} user={item} channelId={channelId} action={action}/>;
    });

    return (
        <div className={'user-mode ' + lookupModeClassName(mode)}>
            {domlist}
        </div>
    );
}
UserGroup.propTypes = {
    channelId: PropTypes.number.isRequired,
    mode: PropTypes.string.isRequired,
    list: PropTypes.arrayOf(PropTypes.instanceOf(User)).isRequired,
    action: PropTypes.instanceOf(MessageActionCreator).isRequired,
};

class UserItem extends React.Component {

    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
    }

    render() {
        const user = this.props.user;
        const style = {
            color: '#' + user.name,
        };

        return (
            <button className='user'
                    style={style}
                    onClick={this.onClick}>
                {user.mode}
                {user.name}
            </button>
        );
    }

    shouldComponentUpdate(nextProps) {
        const user = this.props.user;
        const nextUser = nextProps.user;
        const isSameMode = user.mode === nextUser.mode;
        const isSameName = user.name === nextUser.name;

        return !isSameMode || !isSameName;
    }

    onClick() {
        const channelId = this.props.channelId;
        const user = this.props.user.name;
        if (user.indexOf('#') !== -1) {
            return;
        }

        this.action.queryWhoIs(channelId, user);
    }
}
UserItem.propTypes = {
    channelId: PropTypes.number.isRequired,
    user: PropTypes.instanceOf(User).isRequired,
    action: PropTypes.instanceOf(MessageActionCreator).isRequired,
};
