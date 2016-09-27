import {ExIterable} from '../../ExIterable';
import {flatMap} from '../../operator/flatMap';

ExIterable.prototype.flatMap = flatMap;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        flatMap: typeof flatMap;
    }
}
