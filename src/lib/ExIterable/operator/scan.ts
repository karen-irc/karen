import {ExIterable} from '../ExIterable';
import {Operator} from '../Operator';
import {getIterator} from '../util';

type ScanAccumulatorFn<T, R> = (this: void, acc: R, value: T, index: number) => R;

// tslint:disable:no-invalid-this
export function scan<T, R>(this: ExIterable<T>, accumulator: ScanAccumulatorFn<T, R>, seed: R): ExIterable<R> {
    const op = new ScanOperator<T, R>(this, seed, accumulator);
    return this.lift(op);
}
// tslint:enable

class ScanOperator<S, T> implements Operator<S, T> {
    private _source: Iterable<S>;
    private _accumulator: ScanAccumulatorFn<S, T>;
    private _seed: T;

    constructor(source: Iterable<S>, seed: T, accumulator: ScanAccumulatorFn<S, T>) {
        this._source = source;
        this._accumulator = accumulator;
        this._seed = seed;
    }

    call(): Iterator<T> {
        const source: Iterator<S> = getIterator(this._source);
        const iter = new ScanIterator<S, T>(source, this._seed, this._accumulator);
        return iter;
    }
}

class ScanIterator<S, T> implements Iterator<T> {
    // XXX: This will be a null value only if this iterator is completed.
    private _source: Iterator<S> | undefined;
    // XXX: This will be a null value only if this iterator is completed.
    private _accumulator: ScanAccumulatorFn<S, T> | undefined;
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
