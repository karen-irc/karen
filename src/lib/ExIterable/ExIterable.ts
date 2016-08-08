import {Operator} from './Operator';
import {BufferOperator} from './operator/buffer';
import {DoFn, DoOperator} from './operator/do';
import {FilterFn, FilterOperator} from './operator/filter';
import {FlatMapFn, FlatMapOperator} from './operator/flatMap';
import {MapFn, MapOperator, FilterMapOperator} from './operator/map';
import {MemoizeOperator} from './operator/memoize';
import {ScanAccumulatorFn, ScanOperator} from './operator/scan';
import {getIterator} from './util';

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
        const iter: Iterator<T> = getIterator(this);
        let index = 0;
        let next: IteratorResult<T> = iter.next();
        while (!next.done) {
            fn(next.value, index++);
            next = iter.next();
        }
    }

    buffer<T>(this: ExIterable<T>, size: number): ExIterable<Array<T>> {
        if (size <= 0) {
            throw new RangeError('buffer size must be larger than 0');
        }

        const op = new BufferOperator<T, Array<T>>(this, size);
        return this.lift(op);
    }

    do<T>(this: ExIterable<T>, action: DoFn<T>): ExIterable<T> {
        const op = new DoOperator<T>(this, action);
        const lifted = this.lift<T>(op);
        return lifted;
    }

    filter<T>(this: ExIterable<T>, filter: FilterFn<T>): ExIterable<T> {
        const op = new FilterOperator<T>(this, filter);
        const lifted = this.lift<T>(op);
        return lifted;
    }

    flatMap<T, U>(this: ExIterable<T>, selector: FlatMapFn<T, U>): ExIterable<U> {
        const op = new FlatMapOperator<T, U>(this, selector);
        const lifted = this.lift<U>(op);
        return lifted;
    }

    map<T, U>(this: ExIterable<T>, selector: MapFn<T, U>): ExIterable<U> {
        let op: Operator<T, U>;
        const operator: FilterOperator<T> = this._operator as any; // tslint:disable-line:no-any
        if (operator instanceof FilterOperator) {
            op = new FilterMapOperator<T, U>(this._source!, operator.filter, selector);
        }
        else {
            op = new MapOperator<T, U>(this, selector);
        }
        const lifted = this.lift<U>(op);
        return lifted;
    }

    memoize<T>(this: ExIterable<T>, consumerLimit: number = Number.POSITIVE_INFINITY): ExIterable<T> {
        if (consumerLimit <= 0) {
            throw new RangeError('consumer limit must be larger than 0');
        }

        const op = new MemoizeOperator<T>(this, consumerLimit);
        return this.lift(op);
    }

    scan<T, R>(this: ExIterable<T>, accumulator: ScanAccumulatorFn<T, R>, seed: R): ExIterable<R> {
        const op = new ScanOperator<T, R>(this, seed, accumulator);
        return this.lift(op);
    }

    [Symbol.iterator](): Iterator<T> {
        if (this._operator === undefined) {
            return getIterator(this._source!);
        }
        else {
            const iter = this._operator.call();
            return iter;
        }
    }
}
