// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {Some, None, Option} from 'option-t';

import {Channel} from './Channel';
import {ChannelId} from './ChannelDomain';
import {Network} from './Network';
import {NetworkId} from './NetworkDomain';

/**
 *  This object is based on the assumption that
 *  `Network.id` will be unique while the runtime.
 */
export class NetworkSet {
    _idMap: Map<NetworkId, Network>;

    constructor(raw: Array<Network>) {
        this._idMap = new Map<NetworkId, Network>();

        raw.forEach((item) => {
            this._idMap.set(item.id, item);
        });
    }

    add(item: Network): void {
        if (this._idMap.has(item.id)) {
            return;
        }

        this._idMap.set(item.id, item);
    }

    getById(id: NetworkId): Option<Network> {
        const result = this._idMap.get(id);
        if (result === undefined) {
            return new None<Network>();
        }
        else {
            return new Some<Network>(result);
        }
    }

    delete(item: Network): boolean {
        const id = item.id;
        const isDeleted = this._idMap.delete(id);
        return isDeleted;
    }

    getChannelById(channelId: ChannelId): Option<Channel> {
        let result = new None<Channel>();
        for (const network of this._idMap.values()) {
            // XXX: babel transforms this for-of to try-catch-finally.
            // So we returns here, it start to do 'finally' block
            // and supress to return a value in for-of block.
            const channel = network.getChannelById(channelId);
            if (channel.isSome) {
                result = channel;
                break;
            }
        }

        return result;
    }

    getChannelList(): Array<Channel> {
        let result: Array<Channel> = [];
        for (const network of this._idMap.values()) {
            const list = network.getChannelList();
            result = result.concat(list);
        }
        return result;
    }
}
