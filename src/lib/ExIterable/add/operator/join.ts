import {ExIterable} from '../../ExIterable';
import {join, JoinSignature} from '../../operator/join';

ExIterable.prototype.join = join;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        join: JoinSignature<T>;
    }
}
