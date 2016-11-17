import {ExIterable} from '../../ExIterable';
import {buffer} from '../../operator/buffer';

ExIterable.prototype.buffer = buffer;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        buffer: typeof buffer;
    }
}
