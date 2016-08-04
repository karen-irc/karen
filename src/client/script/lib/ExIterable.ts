/**
 *  This provides extensions for ECMA262 2015's iterator.
 *
 *  This adds `map()`, `forEach()`, `filter()`, `flatMap()`, or others
 *  to `Iterable<T>`. This enables features looks like "lazy evaluation".
 *  The design refers RxJS v5's one.
 *
 *  See example:
 *  ```
 *
 *      const iter = ExIterable.create([1, 2, 3]);
 *      // Don't evaluate the result.
 *      const mapped = iter.map( (v) => v + 1 );
 *
 *      // At this, we start to consume the data source.
 *      mapped.forEach( (v) => console.log(v) );
 *
 *      // At this, we start to consume the data source _newly_.
 *      for (const i of mapped) { console.log(v); }
 *   ```
 */
export class ExIterable<T> implements Iterable<T> {

    // tslint:disable:no-any
    protected _source: Iterable<any> | void; // cheat to drop type param `S`.
    protected _operator: Operator<any, T> | void; // cheat to drop type param `S`.
    // tslint:enable

    protected constructor(source?: Iterable<T>) {
        this._source = source;
        this._operator = undefined;
    }

    static create<T>(source: Iterable<T>): ExIterable<T> {
        return new ExIterable<T>(source);
    }

    lift<U>(operator: Operator<T, U>): ExIterable<U> {
        const iterable = new ExIterable<U>();
        iterable._source = this;
        iterable._operator = operator;
        return iterable;
    }

    forEach(fn: (v: T, index: number) => void): void {
        const iter: Iterator<T> = this[Symbol.iterator]();
        let index = 0;
        let next: IteratorResult<T> = iter.next();
        while (!next.done) {
            fn(next.value, index++);
            next = iter.next();
        }
    }

    map<U>(selector: (this: undefined, value: T, index: number) => U): ExIterable<U> {
        let op: Operator<T, U>;
        if (this._operator instanceof FilterOperator) {
            op = new FilterMapOperator<T, U>(this._source!, this._operator.filter, selector);
        }
        else {
            op = new MapOperator<T, U>(this, selector);
        }
        const lifted = this.lift<U>(op);
        return lifted;
    }

    flatMap<U>(selector: (this: undefined, value: T, index: number) => Iterable<U>): ExIterable<U> {
        const op = new FlatMapOperator<T, U>(this, selector);
        const lifted = this.lift<U>(op);
        return lifted;
    }

    filter(filter: (this: undefined, value: T, index: number) => boolean): ExIterable<T> {
        const op = new FilterOperator<T>(this, filter);
        const lifted = this.lift<T>(op);
        return lifted;
    }

    do(action: (this: undefined, value: T, index: number) => void): ExIterable<T> {
        const op = new DoOperator<T>(this, action);
        const lifted = this.lift<T>(op);
        return lifted;
    }

    cache(): ExIterable<T> {
        const op = new CacheOperator<T>(this);
        return this.lift(op);
    }

    [Symbol.iterator](): Iterator<T> {
        if (this._operator === undefined) {
            return this._source[Symbol.iterator]();
        }
        else {
            const iter = this._operator.call();
            return iter;
        }
    }
}

interface Operator<S, T> {
    source?: Iterable<S>;
    call(): Iterator<T>;
}

type MapFn<T, U> = (v: T, index: number) => U;

class MapOperator<S, T> implements Operator<S, T> {
    private _source: Iterable<S>;
    private _selector: MapFn<S, T>;

    constructor(source: Iterable<S>, selector: MapFn<S, T>) {
        this._source = source;
        this._selector = selector;
    }

    call(): Iterator<T> {
        const source: Iterator<S> = this._source[Symbol.iterator]();
        const iter = new MapIterator<S, T>(source, this._selector);
        return iter;
    }
}

class MapIterator<S, T> implements Iterator<T> {

    private _source: Iterator<S>;
    private _selector: MapFn<S, T>;
    private _index: number;

    constructor(source: Iterator<S>, selector: MapFn<S, T>) {
        this._source = source;
        this._selector = selector;
        this._index = 0;
    }

    next(): IteratorResult<T> {
        const original: IteratorResult<S> = this._source.next();
        if (original.done) {
            return {
                done: true,
                value: undefined as any, // tslint:disable-line:no-any
            };
        }

        const result: T = this._selector(original.value, this._index++);
        return {
            done: false,
            value: result,
        };
    }
}

type FilterFn<T> = (value: T, index: number) => boolean;

class FilterOperator<T> implements Operator<T, T> {

    private _source: Iterable<T>;
    readonly filter: FilterFn<T>;

    constructor(source: Iterable<T>, filter: FilterFn<T>) {
        this._source = source;
        this.filter = filter;
    }

    call(): Iterator<T> {
        const source: Iterator<T> = this._source[Symbol.iterator]();
        const iter = new FilterIterator<T>(source, this.filter);
        return iter;
    }
}

class FilterIterator<T> implements Iterator<T> {

    private _source: Iterator<T>;
    private _filter: FilterFn<T>;
    private _index: number;

    constructor(source: Iterator<T>, filter: FilterFn<T>) {
        this._source = source;
        this._filter = filter;
        this._index = 0;
    }

    next(): IteratorResult<T> {
        const source = this._source;
        const filter = this._filter;
        let next: IteratorResult<T> = source.next();
        while (!next.done) {
            const ok: boolean = filter(next.value, this._index++);
            if (ok) {
                return {
                    done: false,
                    value: next.value,
                };
            }

            next = source.next();
        }

        return {
            done: true,
            value: undefined as any, // tslint:disable-line:no-any
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
        const source: Iterator<S> = this._source[Symbol.iterator]();
        const iter = new FilterMapIterator<S, T>(source, this._filter, this._selector);
        return iter;
    }
}

class FilterMapIterator<S, T> implements Iterator<T> {

    private _source: Iterator<S>;
    private _filter: FilterFn<S>;
    private _selector: MapFn<S, T>;
    private _index: number;
    private _selectorIndex: number;

    constructor(source: Iterator<S>, filter: FilterFn<S>, selector: MapFn<S, T>) {
        this._source = source;
        this._filter = filter;
        this._selector = selector;
        this._index = 0;
        this._selectorIndex = 0;
    }

    next(): IteratorResult<T> {
        const source = this._source;
        const filter = this._filter;
        let next: IteratorResult<S> = source.next();

        while (!next.done) {
            const ok: boolean = filter(next.value, this._index++);
            if (ok) {
                const value = this._selector(next.value, this._selectorIndex++);
                return {
                    done: false,
                    value,
                };
            }

            next = source.next();
        }

        return {
            done: true,
            value: undefined as any, // tslint:disable-line:no-any
        };
    }
}

type FlatMapFn<T, U> = (v: T, index: number) => Iterable<U>;

class FlatMapOperator<S, T> implements Operator<S, T> {
    private _source: Iterable<S>;
    private _selector: FlatMapFn<S, T>;

    constructor(source: Iterable<S>, selector: FlatMapFn<S, T>) {
        this._source = source;
        this._selector = selector;
    }

    call(): Iterator<T> {
        const source: Iterator<S> = this._source[Symbol.iterator]();
        const iter = new FlatMapIterator<S, T>(source, this._selector);
        return iter;
    }
}

class FlatMapIterator<S, T> implements Iterator<T> {

    private _source: Iterator<S>;
    private _inner: Iterator<T> | void;
    private _selector: FlatMapFn<S, T>;
    private _index: number;

    constructor(source: Iterator<S>, selector: FlatMapFn<S, T>) {
        this._source = source;
        this._inner = undefined;
        this._selector = selector;
        this._index = 0;
    }

    next(): IteratorResult<T> {
        while (true) {
            if (this._inner === undefined) {
                const outer: IteratorResult<S> = this._source.next();
                if (outer.done) {
                    return {
                        done: true,
                        value: undefined as any, // tslint:disable-line:no-any
                    };
                }
                const result: Iterable<T> = this._selector(outer.value, this._index++);
                const inner = result[Symbol.iterator]();
                if (!inner) {
                    throw new Error('selector cannot return a valid iterable.');
                }
                this._inner = inner;
            }

            const result: IteratorResult<T> = this._inner.next();
            if (result.done) {
                this._inner = undefined;
                continue;
            }
            else {
                return {
                    done: false,
                    value: result.value,
                };
            }
        }
    }
}

type DoFn<T> = (value: T, index: number) => void;

class DoOperator<T> implements Operator<T, T> {
    private _source: Iterable<T>;
    private _action: DoFn<T>;

    constructor(source: Iterable<T>, action: DoFn<T>) {
        this._source = source;
        this._action = action;
    }

    call(): Iterator<T> {
        const source: Iterator<T> = this._source[Symbol.iterator]();
        const iter = new DoIterator<T>(source, this._action);
        return iter;
    }
}

class DoIterator<T> implements Iterator<T> {

    private _source: Iterator<T>;
    private _action: DoFn<T>;
    private _index: number;

    constructor(source: Iterator<T>, action: DoFn<T>) {
        this._source = source;
        this._action = action;
        this._index = 0;
    }

    next(): IteratorResult<T> {
        const source = this._source;
        const next: IteratorResult<T> = source.next();
        if (next.done) {
            return {
                done: true,
                value: undefined as any, // tslint:disable-line:no-any
            };
        }

        const result: T = next.value;
        const action: DoFn<T> = this._action;
        action(result, this._index++);
        return {
            done: false,
            value: result,
        };
    }
}

class CacheOperator<T> implements Operator<T, T> {
    private _source: Iterable<T>;
    private _cacheIterator: Iterator<T> | void;
    private _cacheResult: Array<T>;

    constructor(source: Iterable<T>) {
        this._source = source;
        this._cacheIterator = undefined;
        this._cacheResult = [];
    }

    call(): Iterator<T> {
        if (this._cacheIterator === undefined) {
            const source: Iterator<T> = this._source[Symbol.iterator]();
            this._cacheIterator = source;
        }

        const iter = new CacheIterator<T>(this._cacheIterator, this._cacheResult);
        return iter;
    }
}

// XXX:
// This cache logic is just a concept. There may be a some potential leak
class CacheIterator<T> implements Iterator<T> {

    private _source: Iterator<T>;
    private _cache: Array<T> | void;
    private _index: number;
    private _isDone: boolean;

    constructor(source: Iterator<T>, cache: Array<T>) {
        this._source = source;
        this._cache = cache;
        this._index = 0;
        this._isDone = false;
    }

    next(): IteratorResult<T> {
        const current = this._index;
        ++this._index;
        // Even if the slot is filled with `undefined`,
        // it includes as the array's length after assignment a value.
        if (!this._isDone && current <= (this._cache.length - 1)) {
            const value = this._cache[current];
            return {
                done: false,
                value,
            };
        }
        else {
            if (this._isDone) {
                return {
                    done: true,
                    value: undefined as any, // tslint:disable-line:no-any
                };
            }

            const source = this._source;
            const { done, value }: IteratorResult<T> = source.next();
            if (done) {
                this._cache = undefined; // release cache
                this._isDone = true;
                return {
                    done,
                    value: undefined as any, // tslint:disable-line:no-any
                };
            }
            this._cache[current] = value;

            return {
                done: false,
                value,
            };
        }
    }
}
