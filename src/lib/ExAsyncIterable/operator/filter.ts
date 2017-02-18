import { ExAsyncIterable } from '../ExAsyncIterable';
import { Operator } from '../Operator';
import { getAsyncIterator } from '../util';

export type FilterFn<T> = (this: void, value: T, index: number) => boolean;

// tslint:disable:no-invalid-this
export function filter<T>(this: ExAsyncIterable<T>, filter: FilterFn<T>): ExAsyncIterable<T> {
    const op = new FilterOperator<T>(this, filter);
    const lifted = this.lift<T>(op);
    return lifted;
}
// tslint:enable

export class FilterOperator<T> implements Operator<T, T> {

    private _source: AsyncIterable<T>;
    readonly filter: FilterFn<T>;

    constructor(source: AsyncIterable<T>, filter: FilterFn<T>) {
        this._source = source;
        this.filter = filter;
    }

    call(): AsyncIterator<T> {
        const source: AsyncIterator<T> = getAsyncIterator(this._source);
        const iter = FilterAsyncIterator<T>(source, this.filter);
        return iter;
    }
}

async function* FilterAsyncIterator<T>(source: AsyncIterator<T>, filter: FilterFn<T>): AsyncIterableIterator<T> {
    let index = 0;
    while (true) {
        const { done, value, }: IteratorResult<T> = await source.next();
        if (done) {
            return value;
        }

        const ok: boolean = filter(value, index++);
        if (ok) {
            yield value;
        }
        else {
            continue;
        }
    }
}
