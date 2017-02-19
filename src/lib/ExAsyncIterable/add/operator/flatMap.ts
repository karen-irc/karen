import { ExAsyncIterable } from '../../../ExAsyncIterable';
import { flatMap } from '../../operator/flatMap';

ExAsyncIterable.prototype.flatMap = flatMap;

declare module '../../ExAsyncIterable' {
    interface ExAsyncIterable<T> {
        flatMap: typeof flatMap;
    }
}
