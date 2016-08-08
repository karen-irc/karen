import {ExIterable} from '../../ExIterable';
import {scan, ScanSignature} from '../../operator/scan';

ExIterable.prototype.scan = scan;

declare module '../../ExIterable' {
    interface ExIterable<T> {
        scan: ScanSignature<T>;
    }
}
