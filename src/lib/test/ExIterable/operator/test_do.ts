import * as assert from 'assert';
import {ExIterable} from '../../../ExIterable';

import {getIterator} from '../util';

describe('ExIterable.do()', function () {
    describe('don\'t re-iterate again after completed', () => {
        let result1: boolean;
        let result2: boolean;

        before(() => {
            const src = ExIterable.create([]).do(() => {});
            const iter = getIterator(src);
            result1 = iter.next().done;
            result2 = iter.next().done;
        });

        it('the 1st time should be expected', () => {
            assert.deepStrictEqual(result1, true);
        });

        it('the 2nd time should be expected', () => {
            assert.deepStrictEqual(result2, true);
        });
    });

    describe('simple case', () => {
        const resultSeq: Array<number> = [];
        const indexSeq: Array<number> = [];

        before(function () {
            const iter = ExIterable.create([0, 1, 2])
                .do((v, i) => {
                    indexSeq.push(i);
                    return String(v);
                });
            iter.forEach((v) => {
                resultSeq.push(v);
            });
        });

        it('expected result sequence', function () {
            assert.deepStrictEqual(resultSeq, [0, 1, 2]);
        });

        it('expected index sequence', function () {
            assert.deepStrictEqual(indexSeq, [0, 1, 2]);
        });
    });
});
