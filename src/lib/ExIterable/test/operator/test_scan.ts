import * as assert from 'assert';
import {ExIterable} from '../../index';

import {getIterator} from '../util';

describe('ExIterable.scan()', function () {
    describe('don\'t re-iterate again after completed', () => {
        let result1: IteratorResult<number>;
        let result2: IteratorResult<number>;

        before(() => {
            const src = ExIterable.create([0, 1]).scan((acc: number, current: number) => {
                return acc + current;
            }, 0);
            const iter = getIterator(src);
            iter.next();
            iter.next();

            result1 = iter.next();
            result2 = iter.next();
        });

        it('the 1st time should be done', () => {
            assert.strictEqual(result1.done, true);
        });

        it('the 1st time should return the final value', () => {
            assert.strictEqual(result1.value, 1);
        });

        it('the 2nd time should be done', () => {
            assert.strictEqual(result2.done, true);
        });

        it('the 2nd time should not return the final value for gc', () => {
            assert.strictEqual(result2.value, undefined);
        });
    });

    describe('simple iteration', () => {
        const valueSeq: Array<number> = [];
        const accSeq: Array<number> = [];
        const indexSeq: Array<number> = [];
        const resultSeq: Array<number> = [];

        before(() => {
            const src = ExIterable.create([0, 1, 2, 3, 4]).scan((acc: number, value: number, index: number) => {
                valueSeq.push(value);
                accSeq.push(acc);
                indexSeq.push(index);

                return value;
            }, 0);
            src.forEach((v: number) => {
                resultSeq.push(v);
            });
        });

        it('valueSeq', () => {
            assert.deepStrictEqual(valueSeq, [0, 1, 2, 3, 4]);
        });

        it('accSeq', () => {
            assert.deepStrictEqual(accSeq, [0, 0, 1, 2, 3]);
        });

        it('indexSeq', () => {
            assert.deepStrictEqual(indexSeq, [0, 1, 2, 3, 4]);
        });

        it('resultSeq', () => {
            assert.deepStrictEqual(resultSeq, [0, 1, 2, 3, 4]);
        });
    });
});
