import { ExAsyncIterable } from '../../../ExAsyncIterable';
import { map } from '../../operator/map';

ExAsyncIterable.prototype.map = map;

declare module '../../ExAsyncIterable' {
    interface ExAsyncIterable<T> {
        map: typeof map;
    }
}
