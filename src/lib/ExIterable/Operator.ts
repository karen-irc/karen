export interface Operator<S, T> {
    source?: Iterable<S>;
    call(): Iterator<T>;
}
