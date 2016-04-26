import {NetworkId} from './Network';

export type ChannelId = number;

export type ChannelType = 'channel' | 'lobby' | 'query';

export class Channel {

    constructor(owner: NetworkId, param: any) {}

    id(): ChannelId {
        throw new Error();
    }
    type(): ChannelType {
        throw new Error();
    }
}

export class LobbyChannel extends Channel {

    constructor(owner: NetworkId) {
        super(owner, {});
    }

    type(): ChannelType {
        return 'lobby';
    }
}