import {ExIterable} from '../../ExIterable';
import {doExIterable} from '../../operator/do';

ExIterable.prototype.do = doExIterable;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        do: typeof doExIterable;
    }
}
