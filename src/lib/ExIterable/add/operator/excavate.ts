import {ExIterable} from '../../ExIterable';
import {excavate, ExcavateSignature} from '../../operator/excavate';

ExIterable.prototype.excavate = excavate;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        excavate: ExcavateSignature<T>;
    }
}
