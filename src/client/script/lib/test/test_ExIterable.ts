import * as assert from 'assert';

import {ExIterable} from '../ExIterable';

class HelperIterable<T> implements Iterable<T> {

    private _source: Iterable<T>;
    private _onNext: (v: IteratorResult<T>) => void;
    private _onAfterFinish: (() => void) | void;

    constructor(src: Iterable<T>, onNext: (v: IteratorResult<T>) => void, onAfterFinish: (() => void) | void = undefined) {
        this._source = src;
        this._onNext = onNext;
        this._onAfterFinish = onAfterFinish;
    }

    [Symbol.iterator](): Iterator<T> {
        const src = this._source[Symbol.iterator]();
        const iter = new HelperIterator(src, this._onNext, this._onAfterFinish);
        return iter;
    }
}

class HelperIterator<T> implements Iterator<T> {

    private _source: Iterator<T>;
    private _onNext: (v: IteratorResult<T>) => void;
    private _onAfterFinish: (() => void) | void;

    constructor(src: Iterator<T>, onNext: (v: IteratorResult<T>) => void, onAfterFinish: (() => void) | void = undefined)  {
        this._source = src;
        this._onNext = onNext;
        this._onAfterFinish = onAfterFinish;
    }

    next(): IteratorResult<T> {
        const result: IteratorResult<T> = this._source.next();
        this._onNext(result);

        if (result.done && (this._onAfterFinish !== undefined)) {
            this._onAfterFinish();
        }

        return result;
    }
}

describe('ExIterable', function () {
    describe('create()', function () {
        let isCalledNext = false;

        before(function () {
            const src = new HelperIterable([1, 2, 3], () => {
                isCalledNext = true;
            });
            const iter = ExIterable.create(src);
            iter;
        });

        it('don\'t evaluate immidiately on creating an instance', () => {
            assert.strictEqual(isCalledNext, false);
        });
    });

    describe('forEach()', function () {
        describe('simple iteration', function () {
            const src = [1, 2, 3];
            const result: Array<number> = [];

            before(function () {
                const iter = ExIterable.create(src);
                iter.forEach((v) => {
                    result.push(v);
                });
            });

            it('iterate all values in source', () => {
                assert.deepStrictEqual(result, src);
            });
        });

        describe('iterate from zero per iteration', function () {
            class Helper {
                private _i: number;
                constructor(seed: number) {
                    this._i = seed;
                }
                value() {
                    return this._i;
                }
                increment() {
                    this._i = this._i + 1;
                }
            }

            const firstSeq: Array<number> = [];
            const secondSeq: Array<number> = [];

            before(function(){
                const src = [0, 1, 2].map((i) => new Helper(i));
                const iter = ExIterable.create(src);
                iter.forEach((v) => {
                    v.increment();
                    firstSeq.push( v.value() );
                });
                iter.forEach((v) => {
                    v.increment();
                    secondSeq.push( v.value() );
                });
            });

            it('first iteration', function () {
                assert.deepStrictEqual(firstSeq, [1, 2, 3]);
            });

            it('second iteration', function () {
                assert.deepStrictEqual(secondSeq, [2, 3, 4]);
            });
        });
    });

    describe('for-of statement', function () {
        describe('simple iteration', function () {
            const src = [1, 2, 3];
            const result: Array<number> = [];

            before(function () {
                const iter = ExIterable.create(src);

                for (const v of iter) {
                    result.push(v);
                }
            });

            it('iterate all values in source', () => {
                assert.deepStrictEqual(result, src);
            });
        });

        describe('iterate from zero per iteration', function () {
            class Helper {
                private _i: number;
                constructor(seed: number) {
                    this._i = seed;
                }
                value() {
                    return this._i;
                }
                increment() {
                    this._i = this._i + 1;
                }
            }

            const firstSeq: Array<number> = [];
            const secondSeq: Array<number> = [];

            before(function(){
                const src = [0, 1, 2].map((i) => new Helper(i));
                const iter = ExIterable.create(src);
                for (const v of iter) {
                    v.increment();
                    firstSeq.push( v.value() );
                }

                for (const v of iter) {
                    v.increment();
                    secondSeq.push( v.value() );
                }
            });

            it('first iteration', function () {
                assert.deepStrictEqual(firstSeq, [1, 2, 3]);
            });

            it('second iteration', function () {
                assert.deepStrictEqual(secondSeq, [2, 3, 4]);
            });
        });
    });

    describe('map()', function () {
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

    describe('flatMap()', function () {
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

    describe('filter()', function () {
        describe('generic case', function () {
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

        describe('specialized map()', function () {
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
                assert.deepStrictEqual(mapSeqOfFilter, [0, 2, 4]);
            });
        });
    });

    describe('do()', function () {
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

    describe('cache()', function () {
        describe('simple case', function () {
            const resultSeq1: Array<number> = [];
            const resultSeq2: Array<number> = [];

            before(function () {
                const src = ExIterable.create([0, 1, 2])
                    .map(() => Math.random());
                const iter = ExIterable.create(src).cache();

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
            function getIterator<T>(s: Iterable<T>): Iterator<T> {
                return s[Symbol.iterator]();
            }
            function pushToArray<T>(i: Iterator<T>, target: Array<IteratorResult<T>>): void {
                const result = i.next();
                target.push(result);
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
                const iterable = ExIterable.create(src).cache();
                iter1 = getIterator(iterable);
                iter2 = getIterator(iterable);
                iter3 = getIterator(iterable);

                iter1.next();
                iter3.next();
                iter2.next();

                pushToArray(iter1, seq1);
                pushToArray(iter2, seq2);
                pushToArray(iter3, seq3);

                pushToArray(iter3, seq3);
                pushToArray(iter2, seq2);
                pushToArray(iter1, seq1);

                pushToArray(iter1, seq1);
                pushToArray(iter3, seq3);
                pushToArray(iter2, seq2);

                pushToArray(iter2, seq2);
                pushToArray(iter1, seq1);
                pushToArray(iter3, seq3);

                pushToArray(iter2, seq2);
                pushToArray(iter3, seq3);
                pushToArray(iter1, seq1);

                pushToArray(iter3, seq3);
                pushToArray(iter1, seq1);
                pushToArray(iter2, seq2);
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
});
