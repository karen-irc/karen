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
    list: PropTypes.arrayOf(PropTypes.instanceOf(Channel)).isRequired,
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
                        {'Show more'}
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
    channel: PropTypes.instanceOf(Channel).isRequired,
};
