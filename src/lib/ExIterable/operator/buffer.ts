import {Operator} from '../Operator';
import {getIterator} from '../util';

export class BufferOperator<S, T extends Array<S>> implements Operator<S, T> {
    private _source: Iterable<S>;
    private _size: number;

    constructor(source: Iterable<S>, size: number) {
        this._source = source;
        this._size = size;
    }

    call(): Iterator<T> {
        const source: Iterator<S> = getIterator(this._source);
        const iter = new BufferIterator<S, T>(source, this._size);
        return iter;
    }
}

class BufferIterator<S, T extends Array<S>> implements Iterator<T> {
    // XXX: This will be a null value only if this iterator is completed.
    private _source: Iterator<S> | undefined;
    private readonly _size: number;
    private _lastBuffer: T | undefined;

    constructor(source: Iterator<S>, size: number) {
        this._source = source;
        this._size = size;
        this._lastBuffer = undefined;
    }

    private _destroy(): void {
        this._source = undefined;
        this._lastBuffer = undefined;
    }

    next(): IteratorResult<T> {
        const source = this._source;
        if (source === undefined) {
            return {
                done: true,
                value: undefined as any, // tslint:disable-line:no-any
            };
        }

        const buffer: T = [] as Array<S> as T;
        while (buffer.length < this._size) {
            const next: IteratorResult<S> = source.next();
            if (next.done) {
                this._destroy();
                if (buffer.length === 0) {
                    return {
                        done: true,
                        value: undefined as any, // tslint:disable-line:no-any
                    };
                }
                else {
                    return {
                        done: false,
                        value: buffer,
                    };
                }
            }
            else {
                buffer.push(next.value);
            }
        }

        return {
            done: false,
            value: buffer,
        };
    }
}
