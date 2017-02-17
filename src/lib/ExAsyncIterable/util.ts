export function getAsyncIterator<T>(s: AsyncIterable<T>): AsyncIterator<T> {
    return s[Symbol.asyncIterator]();
}

export async function* convertSyncToAsync<T>(v: Iterable<T>): AsyncIterableIterator<T> {
    yield* v;
}
