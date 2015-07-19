import {ChannelItem} from './ChannelItem';
import Network from '../../domain/Network';
import * as React from 'react';

export class NetworkItemList extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const list = this.props.list.map(function(network){
            return (
                <NetworkItem key={String(network.id)}
                             network={network} />
            );
        });

        return (
            <div>{list}</div>
        );
    }
}
NetworkItemList.propTypes = {
    list: React.PropTypes.arrayOf(React.PropTypes.instanceOf(Network)).isRequired,
};

export class NetworkItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const network = this.props.network;
        const id = String(network.id);

        const channels = network.getChannelList().map(function(channel){
            return (
                <ChannelItem key={String(channel.id)}
                             channel={channel} />
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
NetworkItem.propTypes = {
    network: React.PropTypes.instanceOf(Network).isRequired,
};
