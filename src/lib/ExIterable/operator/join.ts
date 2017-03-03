import { ExIterable } from '../ExIterable';
import { Operator } from '../Operator';
import { getIterator } from '../util';

type JoinKeySelector<T, R> = (this: void, v: T) => R;
type JoinResultSelector<T1, T2, R> = (this: void, outer: T1, inner: T2) => R;

// tslint:disable:no-invalid-this
export function join<TOuter, TInner, TKey, TResult>(this: ExIterable<TOuter>,
    inner: Iterable<TInner>,
    outerkey: JoinKeySelector<TOuter, TKey>,
    innerKey: JoinKeySelector<TInner, TKey>,
    result: JoinResultSelector<TOuter, TInner, TResult>): ExIterable<TResult> {
    const op = new JoinOperator<TOuter, TInner, TKey, TResult>(this, inner, outerkey, innerKey, result);
    const lifted = this.lift<TResult>(op);
    return lifted;
}
// tslint:enable

class JoinOperator<TOuter, TInner, TKey, TResult> implements Operator<TOuter, TResult> {

    private _outer: Iterable<TOuter>;
    private _inner: Iterable<TInner>;
    private _outerKeySelector: JoinKeySelector<TOuter, TKey>;
    private _innerKeySelector: JoinKeySelector<TInner, TKey>;
    private _resultSelector: JoinResultSelector<TOuter, TInner, TResult>;

    constructor(outer: Iterable<TOuter>,
        inner: Iterable<TInner>,
        outerkeySelector: JoinKeySelector<TOuter, TKey>,
        innerKeySelector: JoinKeySelector<TInner, TKey>,
        resultSelector: JoinResultSelector<TOuter, TInner, TResult>) {
        this._outer = outer;
        this._inner = inner;
        this._outerKeySelector = outerkeySelector;
        this._innerKeySelector = innerKeySelector;
        this._resultSelector = resultSelector;
    }

    call(): Iterator<TResult> {
        const iter = new JoinIterator<TOuter, TInner, TKey, TResult>(getIterator(this._outer),
            this._inner,
            this._outerKeySelector,
            this._innerKeySelector,
            this._resultSelector);
        return iter;
    }
}

export class JoinIterator<TOuter, TInner, TKey, TResult> implements Iterator<TResult> {
    private _outer: Iterator<TOuter> | undefined;
    private _inner: Iterable<TInner> | undefined;
    private _outerKeySelector: JoinKeySelector<TOuter, TKey> | undefined;
    private _innerKeySelector: JoinKeySelector<TInner, TKey> | undefined;
    private _resultSelector: JoinResultSelector<TOuter, TInner, TResult> | undefined;

    private _innerSet: Map<TKey, Array<TInner>> | undefined;
    private _isInnerIteration: boolean;
    private _innerIterator: Iterator<TInner> | undefined;
    private _outerResult: TOuter | undefined;

    constructor(outer: Iterator<TOuter>,
        inner: Iterable<TInner>,
        outerkeySelector: JoinKeySelector<TOuter, TKey>,
        innerKeySelector: JoinKeySelector<TInner, TKey>,
        resultSelector: JoinResultSelector<TOuter, TInner, TResult>) {
        this._outer = outer;
        this._inner = inner;
        this._outerKeySelector = outerkeySelector;
        this._innerKeySelector = innerKeySelector;
        this._resultSelector = resultSelector;
        this._innerSet = undefined;
        this._teadownInner();
    }

    private _destroy() {
        this._outer = undefined;
        this._inner = undefined;
        this._outerKeySelector = undefined;
        this._innerKeySelector = undefined;
        this._resultSelector = undefined;
        if (this._innerSet !== undefined) {
            this._innerSet.clear();
        }
        this._innerSet = undefined;
        this._teadownInner();
    }

    next(): IteratorResult<TResult> {
        if (this._isInnerIteration) {
            return this._innerNext();
        }
        else {
            return this._outerNext();
        }
    }

    return(): IteratorResult<TResult> {
        this._destroy();
        return {
            done: true,
            value: undefined as any, // tslint:disable-line:no-any
        };
    }

    private _setupInner(inner: Iterable<TInner>, outer: TOuter): void {
        this._isInnerIteration = true;
        this._innerIterator = getIterator(inner);
        this._outerResult = outer;
    }

    private _teadownInner(): void {
        this._isInnerIteration = false;
        this._innerIterator = undefined;
        this._outerResult = undefined;
    }

    private _innerNext(): IteratorResult<TResult> {
        const innerIterator = this._innerIterator;
        const resultSelector = this._resultSelector;
        if (!innerIterator) {
            throw new TypeError('no innerIterator');
        }

        if (!resultSelector) {
            throw new TypeError('no resultSelector');
        }

        const innerResult = innerIterator.next();
        if (innerResult.done) {
            this._teadownInner();
            return this._outerNext();
        }

        // XXX: we cannot check `outerResult` because it might be `undefined`.
        // tslint:disable-next-line:no-non-null-assertion
        const outerResult = this._outerResult!;
        const innerItem = innerResult.value;
        const finalResult: TResult = resultSelector(outerResult, innerItem);
        return {
            done: false,
            value: finalResult,
        };
    }

    private _outerNext(): IteratorResult<TResult> {
        const outer = this._outer;
        const inner = this._inner;
        const outerSelector = this._outerKeySelector;
        const innerSelector = this._innerKeySelector;
        const resultSelector = this._resultSelector;
        if (!outer ||
            !outerSelector || !resultSelector ||
            !inner || !innerSelector) {
            return {
                done: true,
                value: undefined as any, // tslint:disable-line:no-any
            };
        }

        while (true) {
            const outerResult: IteratorResult<TOuter> = outer.next();
            if (outerResult.done) {
                this._destroy();
                return {
                    done: true,
                    value: undefined as any, // tslint:disable-line:no-any
                };
            }

            if (this._innerSet === undefined) {
                this._innerSet = toLookUp<TKey, TInner>(inner, innerSelector);
            }

            const outerItem = outerResult.value;
            const key: TKey = outerSelector(outerItem);
            const innerItem: Array<TInner> | undefined = this._innerSet.get(key);
            if (innerItem === undefined) {
                continue;
            }

            this._setupInner(innerItem, outerItem);
            return this._innerNext();
        }
    }
}

function toLookUp<K, V>(src: Iterable<V>, idSelector: (this: void, v: V) => K): Map<K, Array<V>> {
    const map = new Map<K, Array<V>>();
    for (const item of src) {
        const id = idSelector(item);
        let list = map.get(id);
        if (list === undefined) {
            list = [] as Array<V>;
        }
        list.push(item);
        map.set(id, list);
    }
    return map;
}
