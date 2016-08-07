import {ExIterable} from '../../ExIterable';
import {map, MapSignature} from '../../operator/map';

ExIterable.prototype.map = map;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        map: MapSignature<T>;
    }
}
