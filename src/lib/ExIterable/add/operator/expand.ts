import {ExIterable} from '../../ExIterable';
import {expand, ExpandSignature} from '../../operator/expand';

ExIterable.prototype.expand = expand;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        expand: ExpandSignature<T>;
    }
}
