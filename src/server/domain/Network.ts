import {ChannelId} from './Channel';
import {LiveAccountId} from './LiveAccount';

export type NetworkId = number;

export class Network {

    constructor(owner: LiveAccountId, param: any) {
    }

    id(): NetworkId {
        throw new Error();
    }

    channels(): Set<ChannelId> {
        throw new Error();
    }
}