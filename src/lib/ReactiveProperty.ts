// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import {BehaviorSubject, Observable, Observer} from 'rxjs';

export class ReactiveProperty<T> implements Observer<T> {

    private _subject: BehaviorSubject<T>;

    constructor(initial: T) {
        this._subject = new BehaviorSubject<T>(initial);
    }

    unsubscribe(): void {
        return this._subject.unsubscribe();
    }

    get isUnsubscribed(): boolean {
        return this._subject.isUnsubscribed;
    }

    next(value: T): void {
        this._subject.next(value);
    }

    // XXX: `Rx.Subject.error()` requires `any` as its arguments
    error(err: any): void { // tslint:disable-line:no-any
        this._subject.error(err);
    }

    complete(): void {
        this._subject.complete();
    }

    asObservable(): Observable<T> {
        return this._subject;
    }

    distinctUntilChanged(): Observable<T> {
        return this._subject.distinctUntilChanged();
    }

    value(): T {
        return this._subject.getValue();
    }

    setValue(value: T): void {
        return this.next(value);
    }
}
