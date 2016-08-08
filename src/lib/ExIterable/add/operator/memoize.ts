import {ExIterable} from '../../ExIterable';
import {memoize, MemoizeSignature} from '../../operator/memoize';

ExIterable.prototype.memoize = memoize;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        memoize: MemoizeSignature<T>;
    }
}
