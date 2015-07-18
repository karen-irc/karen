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
