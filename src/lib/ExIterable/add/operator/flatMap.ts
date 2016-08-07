import {ExIterable} from '../../ExIterable';
import {flatMap, FlatMapSignature} from '../../operator/flatMap';

ExIterable.prototype.flatMap = flatMap;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        flatMap: FlatMapSignature<T>;
    }
}
