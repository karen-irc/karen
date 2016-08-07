import {ExIterable} from '../../ExIterable';
import {filter} from '../../operator/filter';

ExIterable.prototype.filter = filter;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        filter: typeof filter;
    }
}
