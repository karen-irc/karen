import {ExIterable} from '../../ExIterable';
import {scan} from '../../operator/scan';

ExIterable.prototype.scan = scan;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        scan: typeof scan;
    }
}
