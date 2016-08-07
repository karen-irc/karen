import * as assert from 'assert';
import {ExIterable} from '../../../ExIterable';

import {getIterator} from '../util';

describe('ExIterable.filter()', function () {
    describe('generic case', function () {
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
                const iter = ExIterable.create([0, 1, 2, 3, 4])
                    .filter((v, i) => {
                        indexSeq.push(i);
                        return (v % 2 === 0);
                    });
                iter.forEach((v) => {
                    resultSeq.push(v);
                });
            });

            it('expected result sequence', function () {
                assert.deepStrictEqual(resultSeq, [0, 2, 4]);
            });

            it('expected index sequence', function () {
                assert.deepStrictEqual(indexSeq, [0, 1, 2, 3, 4]);
            });
        });
    });

    describe('specialized map()', function () {
        describe('don\'t re-iterate again after completed', () => {
            let result1: boolean;
            let result2: boolean;

            before(() => {
                const src = ExIterable.create([])
                    .filter((_) => true)
                    .map((_) => {});
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
            const indexSeqOfFilter: Array<number> = [];
            const mapSeqOfFilter: Array<number> = [];

            before(function () {
                const iter = ExIterable.create([0, 1, 2, 3, 4])
                    .filter((v, i) => {
                        indexSeqOfFilter.push(i);
                        return (v % 2 === 0);
                    })
                    .map((v, i) => {
                        mapSeqOfFilter.push(i);
                        return v + 1;
                    });

                iter.forEach((v) => {
                    resultSeq.push(v);
                });
            });

            it('expected result sequence', function () {
                assert.deepStrictEqual(resultSeq, [1, 3, 5]);
            });

            it('expected filter()\'s index sequence', function () {
                assert.deepStrictEqual(indexSeqOfFilter, [0, 1, 2, 3, 4]);
            });

            it('expected the following map()\'s index sequence', function () {
                assert.deepStrictEqual(mapSeqOfFilter, [0, 1, 2]);
            });
        });
    });
});
