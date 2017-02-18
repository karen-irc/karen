import { ExAsyncIterable } from '../../../ExAsyncIterable';
import { filter } from '../../operator/filter';

ExAsyncIterable.prototype.filter = filter;

declare module '../../ExAsyncIterable' {
    interface ExAsyncIterable<T> {
        filter: typeof filter;
    }
}
