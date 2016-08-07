import {ExIterable} from '../../ExIterable';
import {join} from '../../operator/join';

ExIterable.prototype.join = join;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        join: typeof join;
    }
}
