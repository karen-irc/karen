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
import moment from 'moment';

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
        const userImage = (message.userImage === null) ?
            null :
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
                    <button id={'toggle-' + String(message.id)} className='toggle-button'>{'···'}</button>
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
