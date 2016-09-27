import {ExIterable} from '../ExIterable';
import {Operator} from '../Operator';
import {getIterator} from '../util';

type ExcavateSelectorFn<T> = (this: void, value: T) => Iterable<T>;

// tslint:disable:no-invalid-this
export function excavate<T>(this: ExIterable<T>, selector: ExcavateSelectorFn<T>): ExIterable<T> {
    const op = new ExcavateOperator<T>(this, selector);
    return this.lift(op);
}
// tslint:enable

class ExcavateOperator<T> implements Operator<T, T> {
    private _source: Iterable<T>;
    private _selector: ExcavateSelectorFn<T>;;

    constructor(source: Iterable<T>, selector: ExcavateSelectorFn<T>) {
        this._source = source;
        this._selector = selector;
    }

    call(): Iterator<T> {
        const source = getIterator(this._source);
        const iter = new ExcavateIterator<T>(source, this._selector);
        return iter;
    }
}

class ExcavateIterator<T> implements Iterator<T> {
    private _source: Iterator<T> | undefined;
    private _selector: ExcavateSelectorFn<T> | undefined;
    private _stack: Array<Iterator<T>> | undefined;
    private _current: Iterator<T> | undefined;

    constructor(source: Iterator<T>, selector: ExcavateSelectorFn<T>) {
        this._source = source;
        this._selector = selector;
        this._stack = [];
        this._current = source;
    }

    private _destroy(): void {
        this._source = undefined;
        this._selector = undefined;
        this._stack = undefined;
        this._current = undefined;
    }

    next(): IteratorResult<T> {
        const source = this._source;
        const selector = this._selector;
        const stack = this._stack;
        let current = this._current;
        if (!source || !selector || !stack || !current) {
            return {
                done: true,
                value: undefined as any, // tslint:disable-line:no-any
            };
        }

        do {
            let { done, value } = current.next();
            if (!done) {
                stack.push(current); // push only the iterator which may have more item.
                const child: Iterable<T> = selector(value);
                const childIter = getIterator(child);
                this._current = childIter;
                return {
                    done: false,
                    value,
                };
            }
            else {
                current = stack.pop();
            }
        } while (current !== undefined);

        this._destroy();
        return {
            done: true,
            value: undefined as any, // tslint:disable-line:no-any
        };
    }
}
