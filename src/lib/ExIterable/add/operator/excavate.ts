import {ExIterable} from '../../ExIterable';
import {excavate} from '../../operator/excavate';

ExIterable.prototype.excavate = excavate;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        excavate: typeof excavate;
    }
}
