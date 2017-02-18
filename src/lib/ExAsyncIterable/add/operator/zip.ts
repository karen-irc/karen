import { ExAsyncIterable } from '../../../ExAsyncIterable';
import { zip } from '../../operator/zip';

ExAsyncIterable.prototype.zip = zip;

declare module '../../ExAsyncIterable' {
    interface ExAsyncIterable<T> {
        zip: typeof zip;
    }
}
