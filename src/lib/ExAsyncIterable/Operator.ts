export interface Operator<S, T> {
    source?: AsyncIterable<S>;
    call(): AsyncIterator<T>;
}
