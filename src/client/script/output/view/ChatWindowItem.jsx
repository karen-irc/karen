// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as React from 'react';

import {Channel} from '../../domain/Channel';
import {parseToMessageNode} from '../../domain/parseToMessageNode';
import {MessageList} from './MessageItem';

export function ChatWindowList(props) {
    const list = props.list.map(function(item){
        return <ChatWindowItem key={item.id} channel={item}/>;
    });

    return (
        <div>{list}</div>
    );
}
ChatWindowList.propTypes = {
    list: React.PropTypes.arrayOf(React.PropTypes.instanceOf(Channel)).isRequired,
};

export function ChatWindowItem({ channel }){
    let close = '';
    if (channel.type === 'lobby') {
        close = 'Disconnect';
    }
    else if (channel.type === 'query') {
        close = 'Close';
    }
    else {
        close = 'Leave';
    }


    const msg = parseToMessageNode(channel.topic);
    const topic = msg.children.map((node, i) => {
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

    return (
        <div id={'js-chan-' + String(channel.id)}
             data-title={channel.title}
             data-id={String(channel.id)}
             data-type={channel.type}
             className={'chan ' + channel.type}>
            <div className='header'>
                <button className='lt'></button>
                <button className='rt'></button>
                <div className='right'>
                    <button className='button close js-chatwindow-close'>
                        {close}
                    </button>
                </div>
                <span className='title'>{channel.name}</span>
                <span className='topic js-topic'>
                    {topic}
                </span>
            </div>

            <div className='chat'>
                <div className={'show-more ' + ((channel.messages().length > 100) ? 'show' : '')}>
                    <button className='show-more-button' data-id={channel.id}>
                        Show more
                    </button>
                </div>
                <div className='messages'>
                    <MessageList list={channel.messages()}/>
                </div>
            </div>
            <aside className='sidebar'>
                <div className='js-users'>
                </div>
            </aside>
        </div>
    );
}
ChatWindowItem.propTypes = {
    channel: React.PropTypes.instanceOf(Channel).isRequired,
};
