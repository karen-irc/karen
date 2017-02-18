import * as assert from 'assert';

// XXX: Enable to pass a passive listener option.
// tslint:disable:no-any
/**
 *  XXX:
 *      - This does not have any cancellation.
 *      - This might have some leaks.
 */
export function fromDOMEventToAsyncIterable<TEvent extends Event = Event>(src: EventTarget, type: string, option: any): AsyncIterable<TEvent> {
    const iter = new DOMEventAsyncIterable(src, type, option);
    return iter;
}
//tslint:enable

class DOMEventAsyncIterable implements AsyncIterable<Event> {
    private _src: EventTarget | undefined;
    private _type: string;
    private _option: any; // tslint:disable-line:no-any

    private _iters: Set<DOMEventAsyncIterator>;
    private _refCount: number;

    private _callback: (event: Event) => void;

    constructor(src: EventTarget, type: string, option: any) { // tslint:disable-line:no-any
        this._src = src;
        this._type = type;
        this._option = option;

        this._iters = new Set();
        this._refCount = 0;
        this._callback = (event: Event) => {
            this._bufferEvent(event);
        };

        this._init(src);
    }

    private _init(src: EventTarget): void {
        src.addEventListener(this._type, this._callback, this._option);
    }

    destroy(): void {
        const src = this._src;
        if (!src) {
            throw new TypeError('this has been destroyed.');
        }
        if (this._refCount > 0) {
            throw new Error('this is still consumed.');
        }

        src.removeEventListener(this._type, this._callback, this._option);

        this._option = null;

        this._iters.clear();
        this._callback = null as any; // tslint:disable-line:no-any
    }

    private _bufferEvent(event: Event): void {
        if (this._refCount === 0) {
            return;
        }

        for (const iter of this._iters) {
            iter._passNext(event);
        }
    }

    [Symbol.asyncIterator](): AsyncIterator<Event> {
        this._refCount += 1;
        const iter = new DOMEventAsyncIterator(this);
        this._iters.add(iter);
        return iter;
    }

    _decrementRef(v: DOMEventAsyncIterator): void {
        this._iters.delete(v);
        this._refCount = this._refCount - 1;
        assert.ok(this._refCount >= 0);
    }
}

class DOMEventAsyncIterator implements AsyncIterator<Event> {

    private _parent: DOMEventAsyncIterable;
    private _queuedResolver: Array<[(r: IteratorResult<Event>) => void, (e: Error) => void]> | undefined;
    private _buffer: Array<Event> | undefined;

    constructor(parent: DOMEventAsyncIterable) {
        this._parent = parent;
        this._queuedResolver = [];
        this._buffer = [];
    }

    _passNext(event: Event): void {
        const q = this._queuedResolver;
        const b = this._buffer;
        if (q === undefined || b === undefined) {
            throw new TypeError('this has been closed.');
        }

        if (q.length === 0) {
            b.push(event);
        }
        else {
            const next = q.shift();
            if (next === undefined) {
                throw new RangeError('next is not valid');
            }

            const [resolve] = next;
            resolve({
                done: false,
                value: event,
            });
        }
    }

    next(): Promise<IteratorResult<Event>> {
        const p = new Promise((resolve, reject) => {
            const q = this._queuedResolver;
            const b = this._buffer;
            if (q === undefined || b === undefined) {
                resolve({
                    done: true,
                });
                return;
            }

            if (b.length > 0) {
                const event = b.shift();
                if (event === undefined) {
                    throw new RangeError();
                }
                resolve({
                    done: false,
                    value: event,
                });
            }
            else {
                q.push([resolve, reject]);
            }
        });
        return p;
    }

    return(): Promise<IteratorResult<Event>> {
        const q = this._queuedResolver;
        const r = Promise.resolve({
            done: true,
        });
        if (q === undefined) {
            return r;
        }

        this._parent._decrementRef(this);
        this._parent = undefined as any; // tslint:disable-line:no-any

        // destory
        this._queuedResolver = undefined;
        this._buffer = undefined;

        for (const [resolve,] of q) {
            resolve({
                done: true,
                value: undefined as any, // tslint:disable-line:no-any
            });
        }
        return r;
    }
}
