import {Operator} from '../Operator';

export type JoinKeySelector<T, R> = (this: void, v: T) => R;
export type JoinResultSelector<T1, T2, R> = (this: void, outer: T1, inner: T2) => R;

export class JoinOperator<TOuter, TInner, TKey, TResult> implements Operator<TOuter, TResult> {

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
        const iter = JoinIterator<TOuter, TInner, TKey, TResult>(this._outer,
                                                                 this._inner,
                                                                 this._outerKeySelector,
                                                                 this._innerKeySelector,
                                                                 this._resultSelector);
        return iter;
    }
}

function* JoinIterator<TOuter, TInner, TKey, TResult>(outer: Iterable<TOuter>,
                                                      inner: Iterable<TInner>,
                                                      outerSelector: JoinKeySelector<TOuter, TKey>,
                                                      innerSelector: JoinKeySelector<TInner, TKey>,
                                                      resultSelector: JoinResultSelector<TOuter, TInner, TResult>): IterableIterator<TResult> {
    let innerSet: Map<TKey, Array<TInner>> | undefined = undefined;

    for (const outerItem of outer) {
        if (innerSet === undefined) {
            innerSet = toLookUp<TKey, TInner>(inner, innerSelector);
        }

        const key: TKey = outerSelector(outerItem);
        const innerItem: Array<TInner> | undefined = innerSet.get(key)!;
        if (innerItem === undefined) {
            continue;
        }

        for (const inner of innerItem) {
            const finalResult: TResult = resultSelector(outerItem, inner);
            yield finalResult;
        }
    }

    if (innerSet !== undefined) {
        innerSet.clear();
        innerSet = undefined;
    }
    return;
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
