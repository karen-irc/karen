import {ExIterable} from '../../ExIterable';
import {doExIterable, DoSignature} from '../../operator/do';

ExIterable.prototype.do = doExIterable;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        do: DoSignature<T>;
    }
}
