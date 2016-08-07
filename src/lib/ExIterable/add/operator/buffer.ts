import {ExIterable} from '../../ExIterable';
import {buffer, BufferSignature} from '../../operator/buffer';

ExIterable.prototype.buffer = buffer;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        buffer: BufferSignature<T>;
    }
}
