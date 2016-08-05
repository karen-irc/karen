// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as React from 'react';

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
    model: React.PropTypes.instanceOf(SidebarViewState).isRequired,
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
    model: React.PropTypes.instanceOf(SidebarViewState).isRequired,
};

function SidebarEmptyContent() {
    return (
        <div className='empty'>
            {'You\'re not connected to any networks yet.'}
        </div>
    );
}
