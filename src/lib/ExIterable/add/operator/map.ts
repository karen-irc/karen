import {ExIterable} from '../../ExIterable';
import {map} from '../../operator/map';

ExIterable.prototype.map = map;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        map: typeof map;
    }
}
