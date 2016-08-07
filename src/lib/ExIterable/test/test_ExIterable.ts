/**
 * MIT License
 *
 * Copyright (c) 2016 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2016 Yusuke Suzuki <utatane.tea@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import * as assert from 'assert';

import {ExIterable} from '../index';

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
});
