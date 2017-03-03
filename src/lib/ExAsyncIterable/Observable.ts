import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';
import { getAsyncIterator } from './util';

export function toObservable<T>(src: AsyncIterable<T>): Observable<T> {
    const o = Observable.create((observer: Observer<T>) => {
        const iter: AsyncIterator<T> = getAsyncIterator(src);

        async function subscriber(iter: AsyncIterator<T>) {
            while (true) {
                const next = await iter.next();
                if (next.done) {
                    observer.next(next.value);
                    return;
                }
                observer.next(next.value);
            }
        }

        const iteation = subscriber(iter);
        iteation.then(() => {
            observer.complete();
        }, (e) => {
            observer.next(e);
        });

        return () => {
            if (typeof iter.return === 'function') {
                iter.return();
            }
            // TODO: some more cancellation
        };
    });
    return o;
}

// Proof of Concept
export function fromObservable<T>(src: Observable<T>): AsyncIterable<T> {
    const i = new FromObservableAsyncIterable(src);
    return i;
}

class FromObservableAsyncIterable<T> implements AsyncIterable<T> {

    private _src: Observable<T>;

    constructor(src: Observable<T>) {
        this._src = src;
    }

    [Symbol.asyncIterator](): AsyncIterator<T> {
        const i = new FromObservableAsyncIterator(this._src);
        return i;
    }
}

class FromObservableAsyncIterator<T> implements AsyncIterator<T> {

    private _isCompleted: boolean;
    private _valBufer: Array<T>;
    private _resolverBuffer: Array<[(v: IteratorResult<T>) => void, (e: Error) => void]>;
    private _subscription: Subscription;

    constructor(src: Observable<T>) {
        this._isCompleted = false;
        this._valBufer = [];
        this._resolverBuffer = [];

        this._subscription = src.subscribe((v) => {
            this._onNext(v);
        }, (e) => {
            this._onError(e);
        }, () => {
            this._onComplete();
        });
    }

    private _onNext(v: T): void {
        if (this._isCompleted) {
            throw new RangeError();
        }

        if (this._resolverBuffer.length > 0) {
            const next = this._resolverBuffer.shift();
            // tslint:disable-next-line:no-non-null-assertion
            const [resolver,] = next!;
            resolver({
                done: false,
                value: v,
            });
        }
        else {
            this._valBufer.push(v);
        }
    }

    private _onError(e: Error): void {
        if (this._resolverBuffer.length > 0) {
            for (const [, reject] of this._resolverBuffer) {
                reject(e);
            }
        }
    }

    next(): Promise<IteratorResult<T>> {
        if (this._isCompleted) {
            const e = new RangeError('');
            return Promise.reject(e);
        }

        const values = this._valBufer;
        let fn: (resolve: (v: IteratorResult<T>) => void, reject: (e: Error) => void) => void;
        if (values.length > 0) {
            const next = values.shift();
            fn = (resolve, _) => {
                resolve({
                    done: false,
                    // tslint:disable-next-line:no-non-null-assertion
                    value: next!,
                });
            };
        }
        else {
            fn = (resolve, reject) => {
                this._resolverBuffer.push([resolve, reject]);
            };
        }

        return new Promise(fn);
    }

    return(): Promise<IteratorResult<T>> {
        const r = Promise.resolve({
            done: true,
            value: undefined as any, // tslint:disable-line:no-any
        });
        if (this._isCompleted) {
            return r;
        }

        this._onComplete();

        return r;
    }

    private _onComplete(): void {
        if (this._isCompleted) {
            return;
        }

        this._isCompleted = true;
        this._subscription.unsubscribe();

        for (const [resolve,] of this._resolverBuffer) {
            resolve({
                done: true,
                value: undefined as any, // tslint:disable-line:no-any
            });
        }

        this._resolverBuffer = undefined as any; // tslint:disable-line:no-any
        this._valBufer = undefined as any; // tslint:disable-line:no-any
        this._subscription = undefined as any; // tslint:disable-line:no-any
    }
}
