import { ExAsyncIterable } from '../ExAsyncIterable';
import { Operator } from '../Operator';
import { getAsyncIterator } from '../util';
import { FilterFn, FilterOperator } from './filter';

type MapFn<T, U> = (this: void, v: T, index: number) => U;

// tslint:disable:no-any no-invalid-this
export function map<T, U>(this: ExAsyncIterable<T>, selector: MapFn<T, U>): ExAsyncIterable<U> {
    let op: Operator<T, U>;
    const operator: FilterOperator<T> = (this as any)._operator;
    if (operator instanceof FilterOperator) {
        // tslint:disable-next-line:no-non-null-assertion
        op = new FilterMapOperator<T, U>((this as any)._source!, operator.filter, selector);
    }
    else {
        op = new MapOperator<T, U>(this, selector);
    }
    const lifted = this.lift<U>(op);
    return lifted;
}
// tslint:enable

class MapOperator<S, T> implements Operator<S, T> {
    private _source: AsyncIterable<S>;
    private _selector: MapFn<S, T>;

    constructor(source: AsyncIterable<S>, selector: MapFn<S, T>) {
        this._source = source;
        this._selector = selector;
    }

    call(): AsyncIterator<T> {
        const source: AsyncIterator<S> = getAsyncIterator(this._source);
        const iter = MapAsyncIterator<S, T>(source, this._selector);
        return iter;
    }
}

async function* MapAsyncIterator<S, T>(source: AsyncIterator<S>, selector: MapFn<S, T>): AsyncIterableIterator<T> {
    let index = 0;
    while (true) {
        const { done, value, }: IteratorResult<S> = await source.next();
        if (done) {
            return;
        }

        const result: T = selector(value, index++);
        yield result;
    }
}

class FilterMapOperator<S, T> implements Operator<S, T> {
    private _source: AsyncIterable<S>;
    private _filter: FilterFn<S>;
    private _selector: MapFn<S, T>;

    constructor(src: AsyncIterable<S>, filter: FilterFn<S>, selector: MapFn<S, T>) {
        this._source = src;
        this._filter = filter;
        this._selector = selector;
    }

    call(): AsyncIterator<T> {
        const source: AsyncIterator<S> = getAsyncIterator(this._source);
        const iter = FilterMapAsyncIterator<S, T>(source, this._filter, this._selector);
        return iter;
    }
}

async function* FilterMapAsyncIterator<S, T>(source: AsyncIterator<S>, filter: FilterFn<S>, selector: MapFn<S, T>): AsyncIterableIterator<T> {
    let index = 0;
    let selectorIndex = 0;
    while (true) {
        let next: IteratorResult<S> = await source.next();
        while (!next.done) {
            const ok: boolean = filter(next.value, index++);
            if (!ok) {
                next = await source.next();
                continue;
            }

            const value = selector(next.value, selectorIndex++);
            yield value;
        }

        return;
    }
}
