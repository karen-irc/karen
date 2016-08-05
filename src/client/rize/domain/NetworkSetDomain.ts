// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as Rx from 'rxjs';

export class RizeNetworkSetDomain {

    private _value: Rx.Observable<RizeNetworkSetValue>;

    constructor() {
        this._value = Rx.Observable.of(new RizeNetworkSetValue()).share();
    }

    getValue(): Rx.Observable<RizeNetworkSetValue> {
        return this._value;
    }
}

export class RizeNetworkSetValue {

    value: string;

    constructor() {
        this.value = 'Thé des Alizés';
    }
}
