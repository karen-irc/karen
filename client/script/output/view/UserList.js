/*global stringcolor:true */

// babel's `es6.forOf` transform uses `Symbol` and 'Array[Symbol.iterator]'.
import 'core-js/modules/es6.array.iterator';
import 'core-js/es6/symbol';

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
    }

    render() {
        const users = this.props.list;

        let count = null;
        if (users.length > 0) {
            const placeholder = (users.length === 1) ? 'user' : 'users';
            count = (
                <div className='count'>
                    <input className='search'
                           placeholder={placeholder}/>
                </div>
            );
        }

        const modeMap = Object.create(null);
        for (const user of users) {
            let mode = modeMap[user.mode];
            if (mode === undefined) {
                mode = [];
                modeMap[user.mode] = mode;
            }

            mode.push(user);
        }

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
