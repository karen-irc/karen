/*global moment:true, stringcolor:true, parseForIRCMessage:true */

import * as React from 'react';
import {ToggleItem} from './ToggleItem';

export class MessageList extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const list = this.props.list.map(function(item){
            return <MessageItem key={item.id} message={item}/>;
        });

        return (
            <div>
                {list}
            </div>
        );
    }
}
MessageList.propTypes = {
    list: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

const formatTimeZone = function (time) {
    if (!time) {
        return '';
    }

    const utc = moment.utc(time, 'HH:mm:ss').toDate();
    return moment(utc).format('HH:mm');
};

export class MessageItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const message = this.props.message;

        let from = null;
        if (message.from !== '') {
            const userImage = (message.userImage === null) ? null :
                <img src={message.userImage} className='user-image'/>;
            const style = {
                color: '#' + stringcolor(message.from)
            };

            from = (
                <button className='user' style={style}>
                    {message.mode}
                    {message.from}
                    {userImage}
                </button>
            );
        }

        let content = null;
        if (message.type === 'toggle') {
            content = (
                <div>
                    <div className='force-newline'>
                        <button id={'toggle-' + String(message.id)} className='toggle-button'>···</button>
                    </div>
                    {!!message.toggle ? <ToggleItem item={message.toggle}/> : null}
                </div>
            );
        }
        else {
            const html = {
                __html: parseForIRCMessage(message.text),
            };
            content = <span dangerouslySetInnerHTML={html} />;
        }

        return (
            <div className={'msg ' + message.type + (message.self ? 'self' : '') }>
                <span className='time'>
                    {formatTimeZone(message.time)}
                </span>
                <span className='from'>
                    {from}
                </span>
                <span className='text'>
                    <em className='type'>{message.type}</em>
                    {content}
                </span>
            </div>
        );
    }
}

MessageItem.propTypes = {
    message: React.PropTypes.object.isRequired,
};
