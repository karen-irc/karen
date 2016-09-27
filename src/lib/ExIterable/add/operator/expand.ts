import {ExIterable} from '../../ExIterable';
import {expand} from '../../operator/expand';

ExIterable.prototype.expand = expand;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        expand: typeof expand;
    }
}
