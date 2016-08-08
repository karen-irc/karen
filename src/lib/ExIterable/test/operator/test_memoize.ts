import * as assert from 'assert';
import {ExIterable} from '../../index';
import {FiniteConsumerMemoizeBuffer} from '../../operator/memoize';

import {getIterator} from '../../util';

describe('ExIterable.memoize()', function () {
    describe('without consumer limitation', () => {
        describe('don\'t re-iterate again after completed', () => {
            let result1: boolean;
            let result2: boolean;

            before(() => {
                const src = ExIterable.create([]).memoize();
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

        describe('simple case', function () {
            const resultSeq1: Array<number> = [];
            const resultSeq2: Array<number> = [];

            before(function () {
                const src = ExIterable.create([0, 1, 2])
                    .map(() => Math.random());
                const iter = ExIterable.create(src).memoize();

                iter.forEach((v) => {
                    resultSeq1.push(v);
                });

                iter.forEach((v) => {
                    resultSeq2.push(v);
                });
            });

            it('expected result 1 & 2 sequence', function () {
                assert.deepStrictEqual(resultSeq1, resultSeq2);
            });
        });

        describe('call `next()` from some iterator by turns', function () {
            function pushToArray<T>(i: Iterator<T>, target: Array<IteratorResult<T>>): () => void  {
                return function () {
                    const result = i.next();
                    target.push(result);
                };
            }

            let iter1: Iterator<number>;
            let iter2: Iterator<number>;
            let iter3: Iterator<number>;

            const seq1: Array<IteratorResult<number>> = [];
            const seq2: Array<IteratorResult<number>> = [];
            const seq3: Array<IteratorResult<number>> = [];

            before(function () {
                const src = ExIterable.create([0, 1, 2, 3, 4])
                    .map((v) => v + Math.random());
                const iterable = ExIterable.create(src).memoize();
                iter1 = getIterator(iterable);
                iter2 = getIterator(iterable);
                iter3 = getIterator(iterable);

                const pushTo1 = pushToArray(iter1, seq1);
                const pushTo2 = pushToArray(iter2, seq2);
                const pushTo3 = pushToArray(iter3, seq3);

                iter1.next();
                iter3.next();
                iter2.next();

                pushTo1();
                pushTo2();
                pushTo3();

                pushTo3();
                pushTo2();
                pushTo1();

                pushTo1();
                pushTo3();
                pushTo2();

                pushTo2();
                pushTo1();
                pushTo3();

                pushTo2();
                pushTo3();
                pushTo1();

                pushTo3();
                pushTo1();
                pushTo2();
            });

            it('iter1 & iter2 are different', function () {
                assert.notStrictEqual(iter1, iter2);
            });

            it('iter1 & iter3 are different', function () {
                assert.notStrictEqual(iter1, iter3);
            });

            it('iter2 & iter3 are different', function () {
                assert.notStrictEqual(iter2, iter3);
            });

            it('seq1 & seq2 are same', function() {
                assert.deepStrictEqual(seq1, seq2);
            });

            it('seq1 & seq3 are same', function() {
                assert.deepStrictEqual(seq1, seq3);
            });

            it('seq2 & seq3 are same', function() {
                assert.deepStrictEqual(seq2, seq3);
            });
        });
    });
    describe('with consumer limitation is larger than actual consumer', () => {
        describe('don\'t re-iterate again after completed', () => {
            const CONSUMER_LIMIT = 3;
            let result1: boolean;
            let result2: boolean;

            before(() => {
                const src = ExIterable.create([]).memoize(CONSUMER_LIMIT);
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

        describe('simple case', function () {
            const CONSUMER_LIMIT = 3;
            const resultSeq1: Array<number> = [];
            const resultSeq2: Array<number> = [];

            before(function () {
                const src = ExIterable.create([0, 1, 2])
                    .map(() => Math.random());
                const iter = ExIterable.create(src).memoize(CONSUMER_LIMIT);

                iter.forEach((v) => {
                    resultSeq1.push(v);
                });

                iter.forEach((v) => {
                    resultSeq2.push(v);
                });
            });

            it('expected result 1 & 2 sequence', function () {
                assert.deepStrictEqual(resultSeq1, resultSeq2);
            });
        });

        describe('call `next()` from some iterator by turns', function () {
            function pushToArray<T>(i: Iterator<T>, target: Array<IteratorResult<T>>): () => void  {
                return function () {
                    const result = i.next();
                    target.push(result);
                };
            }

            const CONSUMER_LIMIT = 4;
            let iter1: Iterator<number>;
            let iter2: Iterator<number>;
            let iter3: Iterator<number>;

            const seq1: Array<IteratorResult<number>> = [];
            const seq2: Array<IteratorResult<number>> = [];
            const seq3: Array<IteratorResult<number>> = [];

            before(function () {
                const src = ExIterable.create([0, 1, 2, 3, 4])
                    .map((v) => v + Math.random());
                const iterable = ExIterable.create(src).memoize(CONSUMER_LIMIT);
                iter1 = getIterator(iterable);
                iter2 = getIterator(iterable);
                iter3 = getIterator(iterable);

                const pushTo1 = pushToArray(iter1, seq1);
                const pushTo2 = pushToArray(iter2, seq2);
                const pushTo3 = pushToArray(iter3, seq3);

                iter1.next();
                iter3.next();
                iter2.next();

                pushTo1();
                pushTo2();
                pushTo3();

                pushTo3();
                pushTo2();
                pushTo1();

                pushTo1();
                pushTo3();
                pushTo2();

                pushTo2();
                pushTo1();
                pushTo3();

                pushTo2();
                pushTo3();
                pushTo1();

                pushTo3();
                pushTo1();
                pushTo2();
            });

            it('iter1 & iter2 are different', function () {
                assert.notStrictEqual(iter1, iter2);
            });

            it('iter1 & iter3 are different', function () {
                assert.notStrictEqual(iter1, iter3);
            });

            it('iter2 & iter3 are different', function () {
                assert.notStrictEqual(iter2, iter3);
            });

            it('seq1 & seq2 are same', function() {
                assert.deepStrictEqual(seq1, seq2);
            });

            it('seq1 & seq3 are same', function() {
                assert.deepStrictEqual(seq1, seq3);
            });

            it('seq2 & seq3 are same', function() {
                assert.deepStrictEqual(seq2, seq3);
            });
        });
    });
    describe('with consumer limitation is same with actual consumer', () => {
        describe('don\'t re-iterate again after completed', () => {
            const CONSUMER_LIMIT = 2;
            let result1: boolean;
            let result2: boolean;

            before(() => {
                const src = ExIterable.create([]).memoize(CONSUMER_LIMIT);
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

        describe('simple case', function () {
            const CONSUMER_LIMIT = 2;
            const resultSeq1: Array<number> = [];
            const resultSeq2: Array<number> = [];

            before(function () {
                const src = ExIterable.create([0, 1, 2])
                    .map(() => Math.random());
                const iter = ExIterable.create(src).memoize(CONSUMER_LIMIT);

                iter.forEach((v) => {
                    resultSeq1.push(v);
                });

                iter.forEach((v) => {
                    resultSeq2.push(v);
                });
            });

            it('expected result 1 & 2 sequence', function () {
                assert.deepStrictEqual(resultSeq1, resultSeq2);
            });
        });

        describe('call `next()` from some iterator by turns', function () {
            function pushToArray<T>(i: Iterator<T>, target: Array<IteratorResult<T>>): () => void  {
                return function () {
                    const result = i.next();
                    target.push(result);
                };
            }

            const CONSUMER_LIMIT = 3;
            let iter1: Iterator<number>;
            let iter2: Iterator<number>;
            let iter3: Iterator<number>;

            const seq1: Array<IteratorResult<number>> = [];
            const seq2: Array<IteratorResult<number>> = [];
            const seq3: Array<IteratorResult<number>> = [];

            before(function () {
                const src = ExIterable.create([0, 1, 2, 3, 4])
                    .map((v) => v + Math.random());
                const iterable = ExIterable.create(src).memoize(CONSUMER_LIMIT);
                iter1 = getIterator(iterable);
                iter2 = getIterator(iterable);
                iter3 = getIterator(iterable);

                const pushTo1 = pushToArray(iter1, seq1);
                const pushTo2 = pushToArray(iter2, seq2);
                const pushTo3 = pushToArray(iter3, seq3);

                iter1.next();
                iter3.next();
                iter2.next();

                pushTo1();
                pushTo2();
                pushTo3();

                pushTo3();
                pushTo2();
                pushTo1();

                pushTo1();
                pushTo3();
                pushTo2();

                pushTo2();
                pushTo1();
                pushTo3();

                pushTo2();
                pushTo3();
                pushTo1();

                pushTo3();
                pushTo1();
                pushTo2();
            });

            it('iter1 & iter2 are different', function () {
                assert.notStrictEqual(iter1, iter2);
            });

            it('iter1 & iter3 are different', function () {
                assert.notStrictEqual(iter1, iter3);
            });

            it('iter2 & iter3 are different', function () {
                assert.notStrictEqual(iter2, iter3);
            });

            it('seq1 & seq2 are same', function() {
                assert.deepStrictEqual(seq1, seq2);
            });

            it('seq1 & seq3 are same', function() {
                assert.deepStrictEqual(seq1, seq3);
            });

            it('seq2 & seq3 are same', function() {
                assert.deepStrictEqual(seq2, seq3);
            });
        });
    });
    describe('with consumer limitation is smaller than actual consumer', () => {
        describe('don\'t re-iterate again after completed', () => {
            const CONSUMER_LIMIT = 1;
            let result1: boolean;
            let result2: boolean;
            let error3: Error;

            before(() => {
                const src = ExIterable.create([]).memoize(CONSUMER_LIMIT);
                const iter = getIterator(src);
                result1 = iter.next().done;
                result2 = iter.next().done;

                try {
                    getIterator(src);
                }
                catch (e) {
                    error3 = e;
                }
            });

            it('the 1st time should be expected', () => {
                assert.deepStrictEqual(result1, true);
            });

            it('the 2nd time should be expected', () => {
                assert.deepStrictEqual(result2, true);
            });

            it('expected error3 instance', () => {
                assert.strictEqual(error3 instanceof RangeError, true);
            });

            it('expected error3 message', () => {
                assert.strictEqual(error3.message, 'this has been reached the consumer limit');
            });
        });

        describe('simple case', function () {
            const CONSUMER_LIMIT = 2;
            const resultSeq1: Array<number> = [];
            const resultSeq2: Array<number> = [];
            let error3: Error;

            before(function () {
                const src = ExIterable.create([0, 1, 2])
                    .map(() => Math.random());
                const iter = ExIterable.create(src).memoize(CONSUMER_LIMIT);

                iter.forEach((v) => {
                    resultSeq1.push(v);
                });

                iter.forEach((v) => {
                    resultSeq2.push(v);
                });

                try {
                    iter.forEach((_) => {});
                }
                catch (e) {
                    error3 = e;
                }
            });

            it('expected result 1 & 2 sequence', function () {
                assert.deepStrictEqual(resultSeq1, resultSeq2);
            });

            it('expected error3 instance', () => {
                assert.strictEqual(error3 instanceof RangeError, true);
            });

            it('expected error3 message', () => {
                assert.strictEqual(error3.message, 'this has been reached the consumer limit');
            });
        });

        describe('call `next()` from some iterator by turns', function () {
            function pushToArray<T>(i: Iterator<T>, target: Array<IteratorResult<T>>): () => void  {
                return function () {
                    const result = i.next();
                    target.push(result);
                };
            }

            const CONSUMER_LIMIT = 3;
            let iter1: Iterator<number>;
            let iter2: Iterator<number>;
            let iter3: Iterator<number>;
            let error4: Error;

            const seq1: Array<IteratorResult<number>> = [];
            const seq2: Array<IteratorResult<number>> = [];
            const seq3: Array<IteratorResult<number>> = [];

            before(function () {
                const src = ExIterable.create([0, 1, 2, 3, 4])
                    .map((v) => v + Math.random());
                const iterable = ExIterable.create(src).memoize(CONSUMER_LIMIT);
                iter1 = getIterator(iterable);
                iter2 = getIterator(iterable);
                iter3 = getIterator(iterable);

                try {
                    getIterator(iterable);
                }
                catch (e) {
                    error4 = e;
                }

                const pushTo1 = pushToArray(iter1, seq1);
                const pushTo2 = pushToArray(iter2, seq2);
                const pushTo3 = pushToArray(iter3, seq3);

                iter1.next();
                iter3.next();
                iter2.next();

                pushTo1();
                pushTo2();
                pushTo3();

                pushTo3();
                pushTo2();
                pushTo1();

                pushTo1();
                pushTo3();
                pushTo2();

                pushTo2();
                pushTo1();
                pushTo3();

                pushTo2();
                pushTo3();
                pushTo1();

                pushTo3();
                pushTo1();
                pushTo2();
            });

            it('iter1 & iter2 are different', function () {
                assert.notStrictEqual(iter1, iter2);
            });

            it('iter1 & iter3 are different', function () {
                assert.notStrictEqual(iter1, iter3);
            });

            it('iter2 & iter3 are different', function () {
                assert.notStrictEqual(iter2, iter3);
            });

            it('seq1 & seq2 are same', function() {
                assert.deepStrictEqual(seq1, seq2);
            });

            it('seq1 & seq3 are same', function() {
                assert.deepStrictEqual(seq1, seq3);
            });

            it('seq2 & seq3 are same', function() {
                assert.deepStrictEqual(seq2, seq3);
            });

            it('expected error4 instance', () => {
                assert.strictEqual(error4 instanceof RangeError, true);
            });

            it('expected error4 message', () => {
                assert.strictEqual(error4.message, 'this has been reached the consumer limit');
            });
        });
    });
    describe('with consumer limitation is 0', () => {
        describe('to call memoize()', () => {
            let error: RangeError;
            before(() => {
                try {
                    ExIterable.create([]).memoize(0);
                }
                catch (e) {
                    error = e;
                }
            });

            it('should be expected error', () => {
                assert.strictEqual(error instanceof RangeError, true);
            });

            it('should be expected message', () => {
                assert.strictEqual(error.message, 'consumer limit must be larger than 0');
            });
        });
    });

    describe('return() with consumer limitation', () => {
        const CONSUMER_LIMIT = 3;

        const EXPECTED_VAL = 1;
        let iter3: Iterator<number>;
        let result: IteratorResult<number>;

        before(() => {
            const src = ExIterable.create([0, 1, 2])
                .memoize(CONSUMER_LIMIT);
            src.forEach(() => {}); // consume once.

            const iter2 = getIterator(src);
            result = iter2.return!(EXPECTED_VAL);

            iter3 = getIterator(src);
        });

        it('should be the expected result.done', () => {
            assert.deepStrictEqual(result.done, true);
        });

        it('should be the expected result.value', () => {
            assert.deepStrictEqual(result.value, EXPECTED_VAL);
        });

        it('should clear internal buffer\'s ref count', () => {
            // XXX: for testing to internal resource leak.
            const buffer: FiniteConsumerMemoizeBuffer<number> = (iter3 as any)._buffer; // tslint:disable-line:no-any
            assert.strictEqual(buffer.consumers, 1);
        });

        it('should clear internal list holded by buffer count', () => {
            // XXX: for testing to internal resource leak.
            const buffer: FiniteConsumerMemoizeBuffer<number> = (iter3 as any)._buffer; // tslint:disable-line:no-any
            const internalMap: Map<number, { count: number }> = (buffer as any)._data; // tslint:disable-line:no-any
            const state = Array.from(internalMap.values(), (v) => v.count);

            // in this test, iter3 still alive.
            assert.deepStrictEqual(state, [1, 1, 1]);
        });
    });
});
