import {Option, Some, None} from 'option-t';

import {Network, NetworkId} from '../domain/Network';

export class NetworkRepository {
    private _map: Map<NetworkId, Network>;

    constructor() {
        this._map = new Map();
    }

    get(id: NetworkId): Option<Network> {
        const item = this._map.get(id);
        if (item === undefined) {
            return new None<Network>();
        }
        return new Some(item);
    }

    set(item: Network): void {
        const id = item.id();
        this._map.set(id, item);
    }
}