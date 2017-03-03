import { ExIterable } from '../ExIterable';
import { Operator } from '../Operator';
import { FilterFn, FilterOperator } from './filter';
import { getIterator } from '../util';

type MapFn<T, U> = (this: void, v: T, index: number) => U;

// tslint:disable:no-any no-invalid-this
export function map<T, U>(this: ExIterable<T>, selector: MapFn<T, U>): ExIterable<U> {
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
    private _source: Iterable<S>;
    private _selector: MapFn<S, T>;

    constructor(source: Iterable<S>, selector: MapFn<S, T>) {
        this._source = source;
        this._selector = selector;
    }

    call(): Iterator<T> {
        const source: Iterator<S> = getIterator(this._source);
        const iter = new MapIterator<S, T>(source, this._selector);
        return iter;
    }
}

class MapIterator<S, T> implements Iterator<T> {

    // XXX: This will be a null value only if this iterator is completed.
    private _source: Iterator<S> | undefined;
    // XXX: This will be a null value only if this iterator is completed.
    private _selector: MapFn<S, T> | undefined;
    private _index: number;

    constructor(source: Iterator<S>, selector: MapFn<S, T>) {
        this._source = source;
        this._selector = selector;
        this._index = 0;
    }

    private _destroy(): void {
        this._source = undefined;
        this._selector = undefined;
    }

    next(): IteratorResult<T> {
        const source = this._source;
        const selector = this._selector;
        if (source === undefined || selector === undefined) {
            return {
                done: true,
                value: undefined as any, // tslint:disable-line:no-any
            };
        }

        const original: IteratorResult<S> = source.next();
        if (original.done) {
            this._destroy();
            return {
                done: true,
                value: undefined as any, // tslint:disable-line:no-any
            };
        }

        const result: T = selector(original.value, this._index++);
        return {
            done: false,
            value: result,
        };
    }
}

class FilterMapOperator<S, T> implements Operator<S, T> {
    private _source: Iterable<S>;
    private _filter: FilterFn<S>;
    private _selector: MapFn<S, T>;

    constructor(src: Iterable<S>, filter: FilterFn<S>, selector: MapFn<S, T>) {
        this._source = src;
        this._filter = filter;
        this._selector = selector;
    }

    call(): Iterator<T> {
        const source: Iterator<S> = getIterator(this._source);
        const iter = new FilterMapIterator<S, T>(source, this._filter, this._selector);
        return iter;
    }
}

class FilterMapIterator<S, T> implements Iterator<T> {

    // XXX: This will be a null value only if this iterator is completed.
    private _source: Iterator<S> | undefined;
    // XXX: This will be a null value only if this iterator is completed.
    private _filter: FilterFn<S> | undefined;
    // XXX: This will be a null value only if this iterator is completed.
    private _selector: MapFn<S, T> | undefined;
    private _index: number;
    private _selectorIndex: number;

    constructor(source: Iterator<S>, filter: FilterFn<S>, selector: MapFn<S, T>) {
        this._source = source;
        this._filter = filter;
        this._selector = selector;
        this._index = 0;
        this._selectorIndex = 0;
    }

    private _destroy(): void {
        this._source = undefined;
        this._filter = undefined;
        this._selector = undefined;
    }

    next(): IteratorResult<T> {
        const source = this._source;
        const filter = this._filter;
        const selector = this._selector;
        if (source === undefined || filter === undefined || selector === undefined) {
            return {
                done: true,
                value: undefined as any, // tslint:disable-line:no-any
            };
        }

        let next: IteratorResult<S> = source.next();

        while (!next.done) {
            const ok: boolean = filter(next.value, this._index++);
            if (ok) {
                const value = selector(next.value, this._selectorIndex++);
                return {
                    done: false,
                    value,
                };
            }

            next = source.next();
        }

        this._destroy();
        return {
            done: true,
            value: undefined as any, // tslint:disable-line:no-any
        };
    }
}
