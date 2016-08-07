import {ExIterable} from '../../ExIterable';
import {filter, FilterSignature} from '../../operator/filter';

ExIterable.prototype.filter = filter;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        filter: FilterSignature<T>;
    }
}
