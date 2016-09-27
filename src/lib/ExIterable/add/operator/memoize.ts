import {ExIterable} from '../../ExIterable';
import {memoize} from '../../operator/memoize';

ExIterable.prototype.memoize = memoize;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        memoize: typeof memoize;
    }
}
