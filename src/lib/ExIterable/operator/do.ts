import {ExIterable} from '../ExIterable';
import {Operator} from '../Operator';
import {getIterator} from '../util';

type DoFn<T> = (this: void, value: T, index: number) => void;

export interface DoSignature<T> {
    (selector: DoFn<T>): ExIterable<T>;
}

// tslint:disable:no-invalid-this
export function doExIterable<T>(this: ExIterable<T>, action: DoFn<T>): ExIterable<T> {
    const op = new DoOperator<T>(this, action);
    const lifted = this.lift<T>(op);
    return lifted;
}
// tslint:enable

class DoOperator<T> implements Operator<T, T> {
    private _source: Iterable<T>;
    private _action: DoFn<T>;

    constructor(source: Iterable<T>, action: DoFn<T>) {
        this._source = source;
        this._action = action;
    }

    call(): Iterator<T> {
        const source: Iterator<T> = getIterator(this._source);
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
