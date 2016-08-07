import {ExIterable} from '../ExIterable';
import {Operator} from '../Operator';
import {getIterator} from '../util';

export type FilterFn<T> = (this: void, value: T, index: number) => boolean;

// tslint:disable:no-invalid-this
export function filter<T>(this: ExIterable<T>, filter: FilterFn<T>): ExIterable<T> {
    const op = new FilterOperator<T>(this, filter);
    const lifted = this.lift<T>(op);
    return lifted;
}
// tslint:enable

export class FilterOperator<T> implements Operator<T, T> {

    private _source: Iterable<T>;
    readonly filter: FilterFn<T>;

    constructor(source: Iterable<T>, filter: FilterFn<T>) {
        this._source = source;
        this.filter = filter;
    }

    call(): Iterator<T> {
        const source: Iterator<T> = getIterator(this._source);
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
