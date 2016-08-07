import {ExIterable} from '../ExIterable';
import {Operator} from '../Operator';
import {getIterator} from '../util';

type FlatMapFn<T, U> = (this: void, v: T, index: number) => Iterable<U>;

// tslint:disable:no-invalid-this
export function flatMap<T, U>(this: ExIterable<T>, selector: FlatMapFn<T, U>): ExIterable<U> {
    const op = new FlatMapOperator<T, U>(this, selector);
    const lifted = this.lift<U>(op);
    return lifted;
}
// tslint:enable

class FlatMapOperator<S, T> implements Operator<S, T> {
    private _source: Iterable<S>;
    private _selector: FlatMapFn<S, T>;

    constructor(source: Iterable<S>, selector: FlatMapFn<S, T>) {
        this._source = source;
        this._selector = selector;
    }

    call(): Iterator<T> {
        const source: Iterator<S> = getIterator(this._source);
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
                const inner = getIterator(result);
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
