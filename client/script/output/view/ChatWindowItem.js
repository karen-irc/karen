/*global moment:true, stringcolor:true, parseForIRCMessage:true */

import * as React from 'react';
import Channel from '../../domain/Channel';
import {MessageList} from './MessageItem';

export class ChatWindowItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const channel = this.props.channel;

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

        const topic = {
            __html: parseForIRCMessage(channel.topic),
        };

        return (
            <div id={'chan-' + String(channel.id)}
                 data-title={channel.title}
                 data-id={String(channel.id)}
                 data-type={channel.type}
                 className={'chan ' + channel.type}>
                <div className='header'>
                    <button className='lt'></button>
                    <button className='rt'></button>
                    <div className='right'>
                        <button className='button close'>
                            {close}
                        </button>
                    </div>
                    <span className='title'>{channel.name}</span>
                    <span className='topic' dangerouslySetInnerHTML={topic}/>
                </div>

                <div className='chat'>
                    <div className={'show-more ' + ((channel.messages.length > 100) ? 'show' : '')}>
                        <button className='show-more-button' data-id={channel.id}>
                            Show more
                        </button>
                    </div>
                    <div className='messages'>
                        <MessageList list={channel.messages}/>
                    </div>
                </div>
                <aside className='sidebar'>
                    <div className='users'>
                    </div>
                </aside>
            </div>
        );
    }
}

ChatWindowItem.propTypes = {
    channel: React.PropTypes.instanceOf(Channel).isRequired,
};
