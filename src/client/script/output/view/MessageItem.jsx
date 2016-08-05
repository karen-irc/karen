// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
/*global moment:true */

import * as React from 'react';
import {parseToMessageNode} from '../../domain/parseToMessageNode';
import {ToggleItem} from './ToggleItem';

export function MessageList(props) {
    const list = props.list.map(function(item){
        return <MessageItem key={item.id} message={item}/>;
    });

    return (
        <div>
            {list}
        </div>
    );
}
MessageList.propTypes = {
    list: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

function formatTimeZone(time) {
    if (!time) {
        return '';
    }

    const utc = moment.utc(time, 'HH:mm:ss').toDate();
    return moment(utc).format('HH:mm');
}

export function MessageItem({ message }) {
    let from = null;
    if (message.from !== '') {
        const userImage = (message.userImage === null) ? null :
            <img src={message.userImage} className='user-image'/>;
        const style = {
            color: '#' + message.from
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
        const result = parseToMessageNode(message.text);
        const html = result.children.map((node, i) => {
            let jsx = null;
            switch (node.type) {
                case 'text':
                    jsx = <span key={i}>{node.value}</span>;
                    break;
                case 'url':
                    jsx = <a key={i} href={node.value} target={'_blank'}>{node.value}</a>;
                    break;
            }
            return jsx;
        });
        content = <span>{html}</span>;
    }

    return (
        <div className={'msg ' + message.type + (message.self ? 'self' : '')}>
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
MessageItem.propTypes = {
    message: React.PropTypes.object.isRequired,
};
