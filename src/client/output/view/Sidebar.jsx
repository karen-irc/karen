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

import {SidebarViewState} from '../viewmodel/SidebarStore';

import {SidebarNetworkItem} from './SidebarNetworkItemList';

export function Sidebar({ model }) {
    const list = model.list();
    let view = null;
    if (list.length > 0) {
        view = <SidebarSomeContent model={model}/>;
    }
    else {
        view = <SidebarEmptyContent/>;
    }

    return (
        <div className='tse-content'>
            {view}
        </div>
    );
}
Sidebar.propTypes = {
    model: PropTypes.instanceOf(SidebarViewState).isRequired,
};

function SidebarSomeContent({ model }) {
    const selectedId = model.currentId();
    const notableChannelSet = model.notableChannelSet();
    const unreadCountMap = model.unreadCountMap();
    const uiAction = model.uiAction();
    const msgAction = model.msgAction();
    const list = model.list().map(function(network){
        return (
            <SidebarNetworkItem key={String(network.id)}
                                network={network}
                                selectedId={selectedId}
                                notableChannelSet={notableChannelSet}
                                unreadCountMap={unreadCountMap}
                                uiAction={uiAction}
                                msgAction={msgAction}/>
        );
    });

    return (
        <div className='networks'>
            <div>{list}</div>
        </div>
    );
}
SidebarSomeContent.propTypes = {
    model: PropTypes.instanceOf(SidebarViewState).isRequired,
};

function SidebarEmptyContent() {
    return (
        <div className='empty'>
            {'You\'re not connected to any networks yet.'}
        </div>
    );
}
