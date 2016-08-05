// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as React from 'react';
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
    channelId: React.PropTypes.number.isRequired,
    list: React.PropTypes.arrayOf(React.PropTypes.instanceOf(User)).isRequired,
    action: React.PropTypes.instanceOf(MessageActionCreator).isRequired,
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
    channelId: React.PropTypes.number.isRequired,
    mode: React.PropTypes.string.isRequired,
    list: React.PropTypes.arrayOf(React.PropTypes.instanceOf(User)).isRequired,
    action: React.PropTypes.instanceOf(MessageActionCreator).isRequired,
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
    channelId: React.PropTypes.number.isRequired,
    user: React.PropTypes.instanceOf(User).isRequired,
    action: React.PropTypes.instanceOf(MessageActionCreator).isRequired,
};
