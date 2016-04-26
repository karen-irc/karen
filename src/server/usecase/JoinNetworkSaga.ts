import {LiveAccountId} from '../domain/LiveAccount';

import {Network} from '../domain/Network';
import {LobbyChannel} from '../domain/Channel';

import {ChannelRepository} from '../repository/ChannelRepository';
import {LiveAccountRepository} from '../repository/LiveAccountRepository';
import {NetworkRepository} from '../repository/NetworkRepository';

interface JoinNetworkArg {
    param: any;
    id: LiveAccountId;
    accountRepo: LiveAccountRepository;
    networkRepo: NetworkRepository;
    channelRepo: ChannelRepository;
}
export function joinNetwork(arg: JoinNetworkArg): boolean {
    const {
        param,
        id,
        accountRepo,
        networkRepo,
        channelRepo,
     } = arg;

     const account = accountRepo.get(id);
     if (account.isNone) {
         return false;
     }

     const network = new Network(id, param);
     const lobby = new LobbyChannel(network.id());
     network.channels().add(lobby.id());

     networkRepo.set(network);
     channelRepo.set(lobby);

     return true;
}