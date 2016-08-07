import {Operator} from '../Operator';
import {getIterator} from '../util';

export class MemoizeOperator<T> implements Operator<T, T> {
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
            const source: Iterator<T> = getIterator(this._source);
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
