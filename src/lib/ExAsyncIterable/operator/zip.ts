import { ExAsyncIterable } from '../ExAsyncIterable';
import { Operator } from '../Operator';
import { getAsyncIterator } from '../util';


// tslint:disable:no-invalid-this
export function zip<T1, T2>(this: ExAsyncIterable<T1>,
    v2: ExAsyncIterable<T2>): ExAsyncIterable<[T1, T2]>;
export function zip<T1, T2, T3>(this: ExAsyncIterable<T1>,
    v2: ExAsyncIterable<T2>,
    v3: ExAsyncIterable<T3>): ExAsyncIterable<[T1, T2, T3]>;
export function zip<T1, T2, T3, T4>(this: ExAsyncIterable<T1>,
    v2: ExAsyncIterable<T2>,
    v3: ExAsyncIterable<T3>,
    v4: ExAsyncIterable<T4>): ExAsyncIterable<[T1, T2, T3, T4]>;
export function zip<T1, T2, T3, T4, T5>(this: ExAsyncIterable<T1>,
    v2: ExAsyncIterable<T2>,
    v3: ExAsyncIterable<T3>,
    v4: ExAsyncIterable<T4>,
    v5: ExAsyncIterable<T5>): ExAsyncIterable<[T1, T2, T3, T4, T5]>;
export function zip<T>(this: ExAsyncIterable<T>, ...args: Array<ExAsyncIterable<T>>): ExAsyncIterable<Array<T>> {
    const op = new ZipOperator(args);
    const lifted = this.lift(op);
    return lifted;
}
// tslint:enable

// This should be handled by variadic type param. But today's TypeScript does not have it.
// So we use `any` type to cheat to implement `Operator`.
// tslint:disable-next-line:no-any
export class ZipOperator<T> implements Operator<any, Array<T>> {

    private _source: Array<AsyncIterable<T>>;

    constructor(source: Array<AsyncIterable<T>>) {
        this._source = source;
    }

    call(): AsyncIterator<Array<T>> {
        const source: Array<AsyncIterator<T>> = this._source.map(getAsyncIterator);
        const iter = ZipAsyncIterator<T>(...source);
        return iter;
    }
}

async function* ZipAsyncIterator<T>(...args: Array<AsyncIterator<T>>): AsyncIterableIterator<Array<T>> {
    while (true) {
        const result: Array<Promise<IteratorResult<T>>> = args.map((item) => item.next());
        const zip: Array<IteratorResult<T>> = await Promise.all(result);
        const someComplete = zip.some((item) => item.done);
        const final = zip.map((item) => item.value);
        if (someComplete) {
            return final;
        }
        else {
            yield final;
        }
    }
}
