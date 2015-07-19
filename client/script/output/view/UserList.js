/*global stringcolor:true */

import * as React from 'react';
import User from '../../domain/User';

const lookupModeClassName = function (mode) {
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
};

export class UserList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            searchText: '',
        };
    }

    render() {
        const users = this.props.list;

        let count = null;
        if (users.length > 0) {
            const placeholder = (users.length === 1) ? 'user' : 'users';
            count = (
                <div className='count'>
                    <input className='search'
                           onChange={this.onChangeSearch.bind(this)}
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

        const list = Object.keys(modeMap).map(function(key) {
            const userList = modeMap[key];
            return <UserGroup key={key} mode={key} list={userList} />;
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
    list: React.PropTypes.arrayOf(React.PropTypes.instanceOf(User)).isRequired,
};

class UserGroup extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const mode = this.props.mode;
        const list = this.props.list.map(function(item){
            return <UserItem key={item.name} user={item} />;
        });

        return (
            <div className={'user-mode ' + lookupModeClassName(mode)}>
                {list}
            </div>
        );
    }
}
UserGroup.propTypes = {
    mode: React.PropTypes.string.isRequired,
    list: React.PropTypes.arrayOf(React.PropTypes.instanceOf(User)).isRequired,
};

class UserItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const user = this.props.user;
        const style = {
            color: '#' + stringcolor(user.name),
        };

        return (
            <button className='user'
                    style={style}>
                    {user.mode}
                    {user.name}
            </button>
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        const user = this.props.user;
        const nextUser = nextProps.user;
        const isSameMode = user.mode === nextUser.mode;
        const isSameName = user.name === nextUser.name;

        return !isSameMode || !isSameName;
    }
}
UserItem.propTypes = {
    user: React.PropTypes.instanceOf(User).isRequired,
};
