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

    memoize(consumerLimit: number = Number.POSITIVE_INFINITY): ExIterable<T> {
        if (consumerLimit <= 0) {
            throw new RangeError('consumer limit must be larger than 0');
        }

        const op = new MemoizeOperator<T>(this, consumerLimit);
        return this.lift(op);
    }

    scan<R>(accumulator: (this: undefined, acc: R, value: T, index: number) => R, seed: R): ExIterable<R> {
        const op = new ScanOperator<T, R>(this, seed, accumulator);
        return this.lift(op);
    }

    buffer(size: number): ExIterable<Array<T>> {
        if (size <= 0) {
            throw new RangeError('buffer size must be larger than 0');
        }

        const op = new BufferOperator<T, Array<T>>(this, size);
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

    // XXX: This will be a null value only if this iterator is completed.
    private _source: Iterator<S> | undefined;
    // XXX: This will be a null value only if this iterator is completed.
    private _selector: MapFn<S, T> | undefined;;
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

    // XXX: This will be a null value only if this iterator is completed.
    private _source: Iterator<T> | undefined;;
    // XXX: This will be a null value only if this iterator is completed.
    private _filter: FilterFn<T> | undefined;;
    private _index: number;

    constructor(source: Iterator<T>, filter: FilterFn<T>) {
        this._source = source;
        this._filter = filter;
        this._index = 0;
    }

    private _destroy(): void {
        this._source = undefined;
        this._filter = undefined;
    }

    next(): IteratorResult<T> {
        const source = this._source;
        const filter = this._filter;
        if (source === undefined || filter === undefined) {
            return {
                done: true,
                value: undefined as any, // tslint:disable-line:no-any
            };
        }

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

        this._destroy();
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

    // XXX: This will be a null value only if this iterator is completed.
    private _source: Iterator<S> | undefined;
    // XXX: This will be a null value only if this iterator is completed.
    private _selector: FlatMapFn<S, T> | undefined;
    private _inner: Iterator<T> | undefined;
    private _index: number;

    constructor(source: Iterator<S>, selector: FlatMapFn<S, T>) {
        this._source = source;
        this._selector = selector;
        this._inner = undefined;
        this._index = 0;
    }

    private _destroy(): void {
        this._source = undefined;
        this._selector = undefined;
        this._inner = undefined;
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

        while (true) {
            if (this._inner === undefined) {
                const outer: IteratorResult<S> = source.next();
                if (outer.done) {
                    this._destroy();
                    return {
                        done: true,
                        value: undefined as any, // tslint:disable-line:no-any
                    };
                }
                const result: Iterable<T> = selector(outer.value, this._index++);
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

    // XXX: This will be a null value only if this iterator is completed.
    private _source: Iterator<T> | undefined;
    // XXX: This will be a null value only if this iterator is completed.
    private _action: DoFn<T> | undefined;
    private _index: number;

    constructor(source: Iterator<T>, action: DoFn<T>) {
        this._source = source;
        this._action = action;
        this._index = 0;
    }

    private _destroy(): void {
        this._source = undefined;
        this._action = undefined;
    }

    next(): IteratorResult<T> {
        const source = this._source;
        const action = this._action;
        if (source === undefined || action === undefined) {
            return {
                done: true,
                value: undefined as any, // tslint:disable-line:no-any
            };
        }

        const next: IteratorResult<T> = source.next();
        if (next.done) {
            this._destroy();
            return {
                done: true,
                value: undefined as any, // tslint:disable-line:no-any
            };
        }

        const result: T = next.value;
        action(result, this._index++);
        return {
            done: false,
            value: result,
        };
    }
}

class MemoizeOperator<T> implements Operator<T, T> {
    private _source: Iterable<T>;
    private _sourceIterator: Iterator<T> | void;
    private _buffer: MemoizeBuffer<T>;
    private _consumersLimit: number;

    constructor(source: Iterable<T>, consumerLimit: number) {
        this._source = source;
        this._sourceIterator = undefined;
        this._buffer = (consumerLimit === Number.POSITIVE_INFINITY) ?
            new InfiniteConsumerMemoizeBuffer<T>() :
            new FiniteConsumerMemoizeBuffer<T>(consumerLimit);
        this._consumersLimit = consumerLimit;
    }

    call(): Iterator<T> {
        if (this._consumersLimit === 0) {
            throw new RangeError('this has been reached the consumer limit');
        }
        --this._consumersLimit;

        if (this._sourceIterator === undefined) {
            const source: Iterator<T> = this._source[Symbol.iterator]();
            this._sourceIterator = source;
        }

        const iter = new MemoizeIterator<T>(this._sourceIterator, this._buffer);
        return iter;
    }
}

class MemoizeIterator<T> implements Iterator<T> {

    // XXX: This will be a null value only if this iterator is completed.
    private _source: Iterator<T> | undefined;
    // XXX: This will be a null value only if this iterator is completed.
    private _buffer: MemoizeBuffer<T> | undefined;
    private _index: number;

    constructor(source: Iterator<T>, buffer: MemoizeBuffer<T>) {
        this._source = source;
        this._buffer = buffer;
        this._index = 0;
    }

    private _destroy(): void {
        this._source = undefined;
        this._buffer = undefined;
    }

    next(): IteratorResult<T> {
        const source = this._source;
        const buffer = this._buffer;
        if (source === undefined || buffer === undefined) {
            return {
                done: true,
                value: undefined as any, // tslint:disable-line:no-any
            };
        }

        const current = this._index;
        ++this._index;

        const isInBuffer = current <= (buffer.length - 1);
        if (isInBuffer) {
            const value = buffer.take(current);
            return {
                done: false,
                value,
            };
        }

        const { done, value }: IteratorResult<T> = source.next();
        if (done) {
            buffer.detach(current);
            this._destroy();
            return {
                done,
                value: undefined as any, // tslint:disable-line:no-any
            };
        }
        else {
            buffer.push(value);
            return {
                done: false,
                value,
            };
        }
    }

    return(v?: T): IteratorResult<T> {
        const result = {
            done: true,
            // XXX: cast to `any` to make the argument optionaly
            value: v as any, // tslint:disable-line:no-any
        };

        const source = this._source;
        const buffer = this._buffer;
        if (source === undefined || buffer === undefined) {
            return result;
        }

        const current = this._index;
        buffer.detach(current);
        this._destroy();
        return result;
    }
}

interface MemoizeBuffer<T> {
    readonly length: number;
    push(v: T): number;
    take(idx: number): T | never;
    detach(from: number): void;
}

class InfiniteConsumerMemoizeBuffer<T> implements MemoizeBuffer<T> {
    private _data: Array<T>;

    constructor() {
        this._data = [];
    }

    get length(): number {
        // Even if the slot is filled with `undefined`,
        // it includes as the array's length after assignment a value.
        return this._data.length;
    }

    push(v: T): number {
        this._data.push(v);
        return this._data.length - 1;
    }

    take(idx: number): T | never {
        const data = this._data;
        if (idx >= data.length) {
            throw new RangeError('access to uninitialized slot');
        }
        return data[idx];
    }

    detach(_: number): void {
    }
}

// export for testing
export class FiniteConsumerMemoizeBuffer<T> implements MemoizeBuffer<T> {
    private _data: Map<number, Refcount<T>>;
    private _length: number;
    private _consumers: number;

    constructor(consumerCount: number) {
        this._data = new Map();
        this._length = 0;
        this._consumers = consumerCount;
    }

    private _destroy(): void {
        this._data.clear();
        this._data = null as any; // tslint:disable-line:no-any
    }

    get length(): number {
        return this._length;
    }

    get consumers(): number {
        return this._consumers;
    }

    push(v: T): number {
        // XXX:
        // the consumer who push this `v` will not call `this.take(i)`
        // to take `v` from this, so we always decrease the recount from `-1`.
        const ref = new Refcount(v, this._consumers - 1);
        const i = this._length;
        ++this._length;
        this._data.set(i, ref);
        return i;
    }

    take(idx: number): T | never {
        if (!(idx < this._length)) {
            throw new RangeError('access to uninitialized slot');
        }

        const v = this._data.get(idx);
        if (v === undefined) {
            throw new RangeError('element has removed');
        }

        --v.count;
        if (v.count === 0) {
            this._data.delete(idx);
        }

        return v.value;
    }

    detach(from: number): void {
        for (let i = from; i < this._length; ++i) {
            this.take(i);
        }
        --this._consumers;

        if (this._consumers === 0) {
            this._destroy();
        }
    }
}

class Refcount<T> {
    readonly value: T;
    count: number;

    constructor(value: T, count: number) {
        this.value = value;
        this.count = count;
    }
}


type ScanAccumulatorFn<T, R> = (this: void, acc: R, value: T, index: number) => R;

class ScanOperator<S, T> implements Operator<S, T> {
    private _source: Iterable<S>;
    private _accumulator: ScanAccumulatorFn<S, T>;;
    private _seed: T;

    constructor(source: Iterable<S>, seed: T, accumulator: ScanAccumulatorFn<S, T>) {
        this._source = source;
        this._accumulator = accumulator;
        this._seed = seed;
    }

    call(): Iterator<T> {
        const source: Iterator<S> = this._source[Symbol.iterator]();
        const iter = new ScanIterator<S, T>(source, this._seed, this._accumulator);
        return iter;
    }
}

class ScanIterator<S, T> implements Iterator<T> {
    // XXX: This will be a null value only if this iterator is completed.
    private _source: Iterator<S> | undefined;
    // XXX: This will be a null value only if this iterator is completed.
    private _accumulator: ScanAccumulatorFn<S, T> | undefined;;
    private _seed: T;
    private _index: number;

    constructor(source: Iterator<S>, seed: T, accumulator: ScanAccumulatorFn<S, T>) {
        this._source = source;
        this._accumulator = accumulator;
        this._seed = seed;
        this._index = 0;
    }

    private _destroy(): void {
        this._source = undefined;
        this._accumulator = undefined;
        this._seed = undefined as any; // tslint:disable-line:no-any
    }

    next(): IteratorResult<T> {
        const source = this._source;
        const accumulator = this._accumulator;
        if (source === undefined || accumulator === undefined) {
            return {
                done: true,
                value: undefined as any, // tslint:disable-line:no-any
            };
        }

        const next: IteratorResult<S> = source.next();
        if (next.done) {
            const finalVal = this._seed;
            this._destroy();
            return {
                done: true,
                value: finalVal,
            };
        }

        const result: T = accumulator(this._seed, next.value, this._index++);
        this._seed = result;
        return {
            done: false,
            value: result,
        };
    }
}

class BufferOperator<S, T extends Array<S>> implements Operator<S, T> {
    private _source: Iterable<S>;
    private _size: number;

    constructor(source: Iterable<S>, size: number) {
        this._source = source;
        this._size = size;
    }

    call(): Iterator<T> {
        const source: Iterator<S> = this._source[Symbol.iterator]();
        const iter = new BufferIterator<S, T>(source, this._size);
        return iter;
    }
}

class BufferIterator<S, T extends Array<S>> implements Iterator<T> {
    // XXX: This will be a null value only if this iterator is completed.
    private _source: Iterator<S> | undefined;
    private readonly _size: number;
    private _lastBuffer: T | undefined;

    constructor(source: Iterator<S>, size: number) {
        this._source = source;
        this._size = size;
        this._lastBuffer = undefined;
    }

    private _destroy(): void {
        this._source = undefined;
        this._lastBuffer = undefined;
    }

    next(): IteratorResult<T> {
        const source = this._source;
        if (source === undefined) {
            return {
                done: true,
                value: undefined as any, // tslint:disable-line:no-any
            };
        }

        const buffer: T = [] as Array<S> as T;
        while (buffer.length < this._size) {
            const next: IteratorResult<S> = source.next();
            if (next.done) {
                this._destroy();
                if (buffer.length === 0) {
                    return {
                        done: true,
                        value: undefined as any, // tslint:disable-line:no-any
                    };
                }
                else {
                    return {
                        done: false,
                        value: buffer,
                    };
                }
            }
            else {
                buffer.push(next.value);
            }
        }

        return {
            done: false,
            value: buffer,
        };
    }
}



