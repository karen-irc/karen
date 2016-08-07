import * as assert from 'assert';
import {ExIterable} from '../../../ExIterable';

import {getIterator} from '../util';

describe('ExIterable.buffer()', () => {
    describe('buffer size is 0', () => {
        let err: Error;
        before(() => {
            try {
                ExIterable.create([]).buffer(0);
            }
            catch (e) {
                err = e;
            }
        });

        it('should be expected instance', () => {
            assert.strictEqual(err instanceof RangeError, true);
        });

        it('should be expected message', () => {
            assert.strictEqual(err.message, 'buffer size must be larger than 0');
        });
    });

    describe('buffer size is larger than the source sequence', () => {
        let result1: IteratorResult<Array<number>>;
        let result2: IteratorResult<Array<number>>;
        before(() => {
            const seed = [0, 1, 2];
            const src = ExIterable.create(seed).buffer(seed.length + 1);
            const iter = getIterator(src);

            result1 = iter.next();
            result2 = iter.next();
        });

        it('1st result should not be completed', () => {
            assert.strictEqual(result1.done, false);
        });

        it('1st result should contains all sequence', () => {
            assert.deepStrictEqual(result1.value, [0, 1, 2]);
        });

        it('2nd result should be completed', () => {
            assert.strictEqual(result2.done, true);
        });

        it('2nd result should be undefined', () => {
            assert.strictEqual(result2.value, undefined);
        });
    });

    describe('buffer size is same with the source sequence', () => {
        let result1: IteratorResult<Array<number>>;
        let result2: IteratorResult<Array<number>>;
        before(() => {
            const seed = [0, 1, 2];
            const src = ExIterable.create(seed).buffer(seed.length);
            const iter = getIterator(src);

            result1 = iter.next();
            result2 = iter.next();
        });

        it('1st result should not be completed', () => {
            assert.strictEqual(result1.done, false);
        });

        it('1st result should contains all sequence', () => {
            assert.deepStrictEqual(result1.value, [0, 1, 2]);
        });

        it('2nd result should be completed', () => {
            assert.strictEqual(result2.done, true);
        });

        it('2nd result should be undefined', () => {
            assert.strictEqual(result2.value, undefined);
        });
    });

    describe('buffer size is smaller than the source sequence', () => {
        describe('without the rest', () => {
            let result1: IteratorResult<Array<number>>;
            let result2: IteratorResult<Array<number>>;
            let result3: IteratorResult<Array<number>>;
            let result4: IteratorResult<Array<number>>;

            before(() => {
                const seed = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                const src = ExIterable.create(seed).buffer(3);
                const iter = getIterator(src);

                result1 = iter.next();
                result2 = iter.next();
                result3 = iter.next();
                result4 = iter.next();
            });

            it('1st result should not be completed', () => {
                assert.strictEqual(result1.done, false);
            });

            it('1st result should contains all sequence', () => {
                assert.deepStrictEqual(result1.value, [1, 2, 3]);
            });

            it('2nd result should not be completed', () => {
                assert.strictEqual(result2.done, false);
            });

            it('2nd result should contains all sequence', () => {
                assert.deepStrictEqual(result2.value, [4, 5, 6]);
            });

            it('3rd result should not be completed', () => {
                assert.strictEqual(result3.done, false);
            });

            it('3rd result should contains all sequence', () => {
                assert.deepStrictEqual(result3.value, [7, 8, 9]);
            });

            it('4th result should be completed', () => {
                assert.strictEqual(result4.done, true);
            });

            it('4th result should be undefined', () => {
                assert.strictEqual(result4.value, undefined);
            });
        });

        describe('with the rest', () => {
            let result1: IteratorResult<Array<number>>;
            let result2: IteratorResult<Array<number>>;
            let result3: IteratorResult<Array<number>>;
            let result4: IteratorResult<Array<number>>;
            let result5: IteratorResult<Array<number>>;

            before(() => {
                const seed = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                const src = ExIterable.create(seed).buffer(3);
                const iter = getIterator(src);

                result1 = iter.next();
                result2 = iter.next();
                result3 = iter.next();
                result4 = iter.next();
                result5 = iter.next();
            });

            it('1st result should not be completed', () => {
                assert.strictEqual(result1.done, false);
            });

            it('1st result should contains all sequence', () => {
                assert.deepStrictEqual(result1.value, [1, 2, 3]);
            });

            it('2nd result should not be completed', () => {
                assert.strictEqual(result2.done, false);
            });

            it('2nd result should contains all sequence', () => {
                assert.deepStrictEqual(result2.value, [4, 5, 6]);
            });

            it('3rd result should not be completed', () => {
                assert.strictEqual(result3.done, false);
            });

            it('3rd result should contains all sequence', () => {
                assert.deepStrictEqual(result3.value, [7, 8, 9]);
            });

            it('4th result should be completed', () => {
                assert.strictEqual(result4.done, false);
            });

            it('4th result should be undefined', () => {
                assert.deepStrictEqual(result4.value, [10]);
            });

            it('5th result should be completed', () => {
                assert.strictEqual(result5.done, true);
            });

            it('5th result should be undefined', () => {
                assert.deepStrictEqual(result5.value, undefined);
            });
        });
    });

    describe('don\'t re-iterate again after completed', () => {
        let result1: boolean;
        let result2: boolean;

        before(() => {
            const src = ExIterable.create([]).buffer(3);
            const iter = getIterator(src);
            result1 = iter.next().done;
            result2 = iter.next().done;
        });

        it('the 1st time should be expected', () => {
            assert.strictEqual(result1, true);
        });

        it('the 2nd time should be expected', () => {
            assert.strictEqual(result2, true);
        });
    });
});
