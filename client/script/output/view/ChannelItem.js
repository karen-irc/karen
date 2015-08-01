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

import Channel from '../../domain/Channel';
import * as React from 'react';

export class ChannelItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const channel = this.props.channel;
        const id = String(channel.id);

        return (
            <div data-id={id}
                 data-target={'#chan-' + id}
                 data-title={channel.name}
                 className={'js-sidebar-channel chan ' + channel.type}>
                <span className='badge'
                      data-count={String(channel.unread)}>
                    { (channel.unread > 0) ? String(channel.unread) : '' }
                </span>
                <span className='close'></span>
                <span className='name'>{channel.name}</span>
            </div>
        );
    }
}

ChannelItem.propTypes = {
    channel: React.PropTypes.instanceOf(Channel).isRequired,
};
