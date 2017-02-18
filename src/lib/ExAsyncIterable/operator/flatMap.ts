import { ExAsyncIterable } from '../ExAsyncIterable';
import { Operator } from '../Operator';
import { getAsyncIterator } from '../util';

type FlatMapFn<T, U> = (this: void, v: T, index: number) => AsyncIterable<U>;

// tslint:disable:no-invalid-this
export function flatMap<T, U>(this: ExAsyncIterable<T>, selector: FlatMapFn<T, U>): ExAsyncIterable<U> {
    const op = new FlatMapOperator<T, U>(this, selector);
    const lifted = this.lift<U>(op);
    return lifted;
}
// tslint:enable

class FlatMapOperator<S, T> implements Operator<S, T> {
    private _source: AsyncIterable<S>;
    private _selector: FlatMapFn<S, T>;

    constructor(source: AsyncIterable<S>, selector: FlatMapFn<S, T>) {
        this._source = source;
        this._selector = selector;
    }

    call(): AsyncIterator<T> {
        const source: AsyncIterator<S> = getAsyncIterator(this._source);
        const iter = FlatMapAsyncIterator<S, T>(source, this._selector);
        return iter;
    }
}

async function* FlatMapAsyncIterator<S, T>(source: AsyncIterator<S>, selector: FlatMapFn<S, T>): AsyncIterableIterator<T> {
    let index = 0;
    let innerCache: AsyncIterator<T> | undefined = undefined; // tslint:disable-line:no-unnecessary-initializer
    while (true) {
        if (innerCache === undefined) {
            const outer: IteratorResult<S> = await source.next();
            if (outer.done) {
                return;
            }
            const result: AsyncIterable<T> = selector(outer.value, index++);
            const inner = getAsyncIterator(result);
            if (!inner) {
                throw new TypeError('selector cannot return a valid iterable.');
            }
            innerCache = inner;
        }

        const { done, value, }: IteratorResult<T> = await innerCache.next();
        if (done) {
            innerCache = undefined;
            continue;
        }
        else {
            yield value;
        }
    }
}
