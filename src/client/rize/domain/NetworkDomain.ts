// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as Rx from 'rxjs';

export type NetworkId = number;

export class RizeNetworkDomain {

    private _id: NetworkId;
    private _nickname: string;

    private _value: Rx.Observable<RizeNetworkValue>;

    constructor(id: NetworkId, nickname: string) {
        this._id = id;
        this._nickname = nickname;

        this._value = Rx.Observable.of(new RizeNetworkValue(id, nickname)).share();
    }

    getValue(): Rx.Observable<RizeNetworkValue> {
        return this._value;
    }
}

export class RizeNetworkValue {
    private _id: NetworkId;
    private _nickname: string;

    constructor(id: NetworkId, nickname: string) {
        this._id = id;
        this._nickname = nickname;
    }

    id(): NetworkId {
        return this._id;
    }

    nickname(): string {
        return this._nickname;
    }
}
