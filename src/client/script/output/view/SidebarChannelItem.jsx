// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as React from 'react';

import {Channel} from '../../domain/Channel';
import {CommandType} from '../../domain/CommandType';

import {MessageActionCreator} from '../../intent/action/MessageActionCreator';
import {UIActionCreator} from '../../intent/action/UIActionCreator';

export class SidebarChannelItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isClosing: false,
        };

        this.onClickSelect = this.onClickSelect.bind(this);
        this.onClickClose = this.onClickClose.bind(this);
    }

    render() {
        const props = this.props;
        const channel = props.channel;
        const isSelected = props.isSelected;
        const id = String(channel.id);
        const isNotable = props.isNotable && !isSelected;
        const unreadCount = props.unreadCount;
        let unreadLabel = '';
        if (!isSelected && unreadCount > 0) {
            unreadLabel = (unreadCount > 999) ?
                (unreadCount / 1000).toFixed(1) + 'k' :
                String(unreadCount);
        }

        const isClosing = this.state.isClosing;

        return (
            <div data-id={id}
                 data-target={'#js-chan-' + id}
                 data-title={channel.name}
                 className={'js-sidebar-channel chan ' + channel.type + (isSelected ? ' active' : '') + (isClosing ? ' js-closing' : '')}
                 onClick={this.onClickSelect}>
                <span className={'badge' + (isNotable ? ' highlight' : '')}
                      data-count={String(unreadCount)}>
                    {unreadLabel}
                </span>
                <span className='close' onClick={this.onClickClose}></span>
                <span className='name'>{channel.name}</span>
            </div>
        );
    }

    onClickSelect(event) {
        event.preventDefault();

        const channel = this.props.channel;
        const channelId = channel.id;
        this.props.uiAction.selectChannel(channelId);
    }

    // FIXME: this part should be in a domain logic layer.
    onClickClose(event) {
        event.preventDefault();
        event.stopPropagation();

        const channel = this.props.channel;
        const channelType = channel.type;
        const isLobby = (channelType === 'lobby');
        const command = isLobby ? CommandType.QUIT : CommandType.CLOSE;
        if (isLobby) {
            /*eslint-disable no-alert*/
            if (!window.confirm('Disconnect from ' + channel.name + '?')) {
                return;
            }
            /*eslint-enable*/
        }
        this.props.msgAction.inputCommand(channel.id, command);

        this.setState({
            isClosing: true,
        });
    }
}
SidebarChannelItem.propTypes = {
    channel: React.PropTypes.instanceOf(Channel).isRequired,
    isSelected: React.PropTypes.bool.isRequired,
    isNotable: React.PropTypes.bool.isRequired,
    unreadCount: React.PropTypes.number.isRequired,
    msgAction: React.PropTypes.instanceOf(MessageActionCreator).isRequired,
    uiAction: React.PropTypes.instanceOf(UIActionCreator).isRequired,
};
