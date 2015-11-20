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

import {OptionBase} from 'option-t';
import * as React from 'react';

import {SidebarChannelItem} from './SidebarChannelItem';
import {Network} from '../../domain/Network';

export class SidebarNetworkItemList extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const props = this.props;
        const selectedId = props.selectedId;
        const notableChannelSet = props.notableChannelSet;
        const list = props.list.map(function(network){
            return (
                <SidebarNetworkItem key={String(network.id)}
                                    network={network}
                                    selectedId={selectedId}
                                    notableChannelSet={notableChannelSet}/>
            );
        });

        return (
            <div>{list}</div>
        );
    }
}
SidebarNetworkItemList.propTypes = {
    list: React.PropTypes.arrayOf(React.PropTypes.instanceOf(Network)).isRequired,
    selectedId: React.PropTypes.instanceOf(OptionBase).isRequired,
    notableChannelSet: React.PropTypes.instanceOf(Set).isRequired,
};

export class SidebarNetworkItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const props = this.props;
        const network = props.network;
        const selectedId = props.selectedId;
        const id = String(network.id);
        const notableChannelSet = props.notableChannelSet;

        const channels = network.getChannelList().map(function(channel){
            const isSelected = selectedId.mapOr(false, function (id) {
                const isSelected = (channel.id === id);
                return isSelected;
            });
            const isNotable = notableChannelSet.has(channel.id);
            return (
                <SidebarChannelItem key={String(channel.id)}
                                    channel={channel}
                                    isSelected={isSelected}
                                    isNotable={isNotable}/>
            );
        });

        return (
            <section id={'network-' + id}
                     className='network'
                     data-id={id}
                     data-nick={network.nickname}>
                {channels}
            </section>
        );
    }
}
SidebarNetworkItem.propTypes = {
    network: React.PropTypes.instanceOf(Network).isRequired,
    selectedId: React.PropTypes.instanceOf(OptionBase).isRequired,
    notableChannelSet: React.PropTypes.instanceOf(Set).isRequired,
};
