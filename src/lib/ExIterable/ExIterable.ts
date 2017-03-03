import { Operator } from './Operator';
import { getIterator } from './util';

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

    [Symbol.iterator](): Iterator<T> {
        if (this._operator === undefined) {
            // tslint:disable-next-line:no-non-null-assertion
            return getIterator(this._source!);
        }
        else {
            const iter = this._operator.call();
            return iter;
        }
    }
}
