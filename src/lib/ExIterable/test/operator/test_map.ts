import * as assert from 'assert';
import {ExIterable} from '../../index';

import {getIterator} from '../util';

describe('ExIterable.map()', function () {
    describe('don\'t re-iterate again after completed', () => {
        let result1: boolean;
        let result2: boolean;

        before(() => {
            const src = ExIterable.create([]).filter(() => true);
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

    describe('iteration', () => {
        const resultSeq: Array<number> = [];
        const indexSeq: Array<number> = [];

        before(function () {
            const iter = ExIterable.create([0, 1, 2])
                .map((v, i) => {
                    indexSeq.push(i);
                    return v + 1;
                });
            iter.forEach((v) => {
                resultSeq.push(v);
            });
        });

        it('expected result sequence', function () {
            assert.deepStrictEqual(resultSeq, [1, 2, 3]);
        });

        it('expected index sequence', function () {
            assert.deepStrictEqual(indexSeq, [0, 1, 2]);
        });
    });
});
