import {Option, Some, None} from 'option-t';

import {Channel, ChannelId} from '../domain/Channel';

export class ChannelRepository {
    private _map: Map<ChannelId, Channel>;

    constructor() {
        this._map = new Map();
    }

    get(id: ChannelId): Option<Channel> {
        const item = this._map.get(id);
        if (item === undefined) {
            return new None<Channel>();
        }
        return new Some(item);
    }

    set(item: Channel): void {
        const id = item.id();
        this._map.set(id, item);
    }
}