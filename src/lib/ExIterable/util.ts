export function getIterator<T>(s: Iterable<T>): Iterator<T> {
    return s[Symbol.iterator]();
}
