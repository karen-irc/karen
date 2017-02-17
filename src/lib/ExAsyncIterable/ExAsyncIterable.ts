import { Operator } from './Operator';
import { getAsyncIterator } from './util';

export class ExAsyncIterable<T> implements AsyncIterable<T> {

    // tslint:disable:no-any
    protected _source: AsyncIterable<any> | undefined; // cheat to drop type param `S`.
    protected _operator: Operator<any, T> | undefined; // cheat to drop type param `S`.
    // tslint:enable

    protected constructor(source?: AsyncIterable<T>) {
        this._source = source;
        this._operator = undefined;
    }

    static create<T>(source: AsyncIterable<T>): ExAsyncIterable<T> {
        return new ExAsyncIterable<T>(source);
    }

    lift<U>(operator: Operator<T, U>): ExAsyncIterable<U> {
        const iterable = new ExAsyncIterable<U>();
        iterable._source = this;
        iterable._operator = operator;
        return iterable;
    }

    async forEach(fn: (v: T, index: number) => void): Promise<void> {
        const iter: AsyncIterator<T> = getAsyncIterator(this);
        let index = 0;
        let result: IteratorResult<T> = await iter.next();
        while (!result.done) {
            fn(result.value, index++);
            result = await iter.next();
        }
    }

    [Symbol.asyncIterator](): AsyncIterator<T> {
        if (this._operator === undefined) {
            return getAsyncIterator(this._source!);
        }
        else {
            const iter = this._operator.call();
            return iter;
        }
    }
}
