import * as assert from 'assert';
import {ExIterable} from '../../index';

import {getIterator} from '../util';

describe('ExIterable.flatMap()', function () {
    describe('don\'t re-iterate again after completed', () => {
        let result1: boolean;
        let result2: boolean;

        before(() => {
            const src = ExIterable.create([]).flatMap(() => []);
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

    describe('basic iteration', function () {
        const resultSeq: Array<number> = [];
        const indexSeq: Array<number> = [];

        class ThreeCount implements IterableIterator<number> {
            private readonly _begin: number;
            private _index: number;

            constructor(begin: number) {
                this._begin = begin;
                this._index = 0;
            }

            next(): IteratorResult<number> {
                if (this._index > 2) {
                    return {
                        done: true,
                        value: -1,
                    };
                }
                else {
                    const count = this._index++;
                    const next = this._begin + count;
                    return {
                        done: false,
                        value: next,
                    };
                }
            }

            [Symbol.iterator](): IterableIterator<number> {
                return this;
            }
        }

        before(function () {
            const iter = ExIterable.create([1, 4, 7])
                .flatMap((v, i) => {
                    indexSeq.push(i);
                    return new ThreeCount(v);
                });
            iter.forEach((v) => {
                resultSeq.push(v);
            });
        });

        it('expected result sequence', function () {
            assert.deepStrictEqual(resultSeq, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });

        it('expected index sequence', function () {
            assert.deepStrictEqual(indexSeq, [0, 1, 2]);
        });
    });
});
