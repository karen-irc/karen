// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as Rx from 'rxjs';

export type ChannelId = number;

export const enum ChannelType {
    Channel,
    Lobby,
    Query,
}

export class RizeChannelDomain {

    private _id: ChannelId;
    private _type: ChannelType;
    private _value: Rx.Observable<RizeChannelValue>;

    constructor(id: ChannelId,
                type: ChannelType) {
        this._id = id;
        this._type = type;
        this._value = Rx.Observable.of(new RizeChannelValue(id, type)).share();
    }

    getValue(): Rx.Observable<RizeChannelValue> {
        return this._value;
    }
}

export class RizeChannelValue {

    private _id: ChannelId;
    private _type: ChannelType;

    constructor(id: ChannelId,
                type: ChannelType) {
        this._id = id;
        this._type = type;
    }

    id(): ChannelId {
        return this._id;
    }

    type(): ChannelType {
        return this._type;
    }
}
