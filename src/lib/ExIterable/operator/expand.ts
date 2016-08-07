import {ExIterable} from '../ExIterable';
import {Operator} from '../Operator';
import {getIterator} from '../util';

type ExpandSelectorFn<T> = (this: void, value: T) => Iterable<T>;

// tslint:disable:no-invalid-this
export function expand<T>(this: ExIterable<T>, selector: ExpandSelectorFn<T>): ExIterable<T> {
    const op = new ExpandOperator<T>(this, selector);
    return this.lift(op);
}
// tslint:enable

class ExpandOperator<T> implements Operator<T, T> {
    private _source: Iterable<T>;
    private _selector: ExpandSelectorFn<T>;;

    constructor(source: Iterable<T>, selector: ExpandSelectorFn<T>) {
        this._source = source;
        this._selector = selector;
    }

    call(): Iterator<T> {
        const source: Iterator<T> = getIterator(this._source);
        const iter = new ExpandIterator<T>(source, this._selector);
        return iter;
    }
}

class ExpandIterator<T> implements Iterator<T> {
    private _source: Iterator<T> | undefined;
    private _selector: ExpandSelectorFn<T> | undefined;
    private _queue: Array<Iterator<T>> | undefined;
    private _current: Iterator<T> | undefined;

    constructor(source: Iterator<T>, selector: ExpandSelectorFn<T>) {
        this._source = source;
        this._selector = selector;
        this._queue = [source];
        this._current = undefined;
    }

    private _destroy(): void {
        this._source = undefined;
        this._selector = undefined;
        this._queue = undefined;
        this._current = undefined;
    }

    next(): IteratorResult<T> {
        const source = this._source;
        const selector = this._selector;
        const queue = this._queue;
        if (!source || !selector || !queue) {
            return {
                done: true,
                value: undefined as any, // tslint:disable-line:no-any
            };
        }

        while (queue.length > 0) {
            if (this._current === undefined) {
                // XXX: queue is always have some element in this path.
                const src: Iterator<T> = queue.shift()!;
                this._current = src;
            }

            let result: IteratorResult<T> = this._current.next();
            if (!result.done) {
                const leaf = selector(result.value);
                const iter = getIterator(leaf);
                queue.push(iter);
                return {
                    done: false,
                    value: result.value,
                };
            }
            else {
                this._current = undefined;
            }
        }

        this._destroy();
        return {
            done: true,
            value: undefined as any, // tslint:disable-line:no-any
        };
    }
}
