import * as assert from 'assert';
import {ExIterable} from '../../index';

import {getIterator} from '../../util';

class A {
    id: number;
    name: string;
    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

class B {
    id: number;
    name: string;
    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

class TestResult {
    id: number;
    a: string;
    b: string;
    constructor(id: number, a: string, b: string) {
        this.id = id;
        this.a = a;
        this.b = b;
    }
}

describe('ExIterable.join()', function () {
    describe('outer is larger than inner', () => {
        const resultSeq: Array<{ id: number; a: string; b:string; }> = [];

        before(function () {
            const outer = ExIterable.create([
                new A(1, 'a'),
                new A(2, 'b'),
                new A(3, 'c'),
                new A(4, 'd'),
                new A(5, 'e'),
                new A(1, 'z'),
            ]);

            const inner = ExIterable.create([
                new B(5, 'f'),
                new B(3, 'g'),
                new B(1, 'h'),
                new B(1, 'i'),
            ]);

            const iter = outer.join(inner, (v: A) => v.id, (v: B) => v.id, (a: A, b: B) => {
                const result = new TestResult(a.id, a.name, b.name);
                return result;
            });

            iter.forEach((v) => {
                resultSeq.push(v);
            });
        });

        it('expected result sequence', function () {
            assert.deepStrictEqual(resultSeq, [
                new TestResult(1, 'a', 'h'),
                new TestResult(1, 'a', 'i'),
                new TestResult(3, 'c', 'g'),
                new TestResult(5, 'e', 'f'),
                new TestResult(1, 'z', 'h'),
                new TestResult(1, 'z', 'i'),
            ]);
        });
    });

    describe('outer is smaller than inner', () => {
        const resultSeq: Array<{ id: number; a: string; b:string; }> = [];

        before(function () {
            const outer = ExIterable.create([
                new A(1, 'a'),
                new A(2, 'b'),
                new A(3, 'c'),
                new A(1, 'd'),
            ]);

            const inner = ExIterable.create([
                new B(2, 'd'),
                new B(3, 'e'),
                new B(4, 'f'),
                new B(1, 'g'),
                new B(1, 'h'),
                new B(12, 'i'),
            ]);

            const iter = outer.join(inner, (v: A) => v.id, (v: B) => v.id, (a: A, b: B) => {
                const result = new TestResult(a.id, a.name, b.name);
                return result;
            });

            iter.forEach((v) => {
                resultSeq.push(v);
            });
        });

        it('expected result sequence', function () {
            assert.deepStrictEqual(resultSeq, [
                new TestResult(1, 'a', 'g'),
                new TestResult(1, 'a', 'h'),
                new TestResult(2, 'b', 'd'),
                new TestResult(3, 'c', 'e'),
                new TestResult(1, 'd', 'g'),
                new TestResult(1, 'd', 'h'),
            ]);
        });
    });

    describe('outer is same length with inner', () => {
        const resultSeq: Array<{ id: number; a: string; b:string; }> = [];

        before(function () {
            const outer = ExIterable.create([
                new A(1, 'a'),
                new A(2, 'b'),
                new A(3, 'c'),
                new A(3, 'd'),
                new A(1, 'e'),
            ]);

            const inner = ExIterable.create([
                new B(12, 'd'),
                new B(24, 'e'),
                new B(36, 'f'),
                new B(3, 'g'),
                new B(3, 'h'),
            ]);

            const iter = outer.join(inner, (v: A) => v.id, (v: B) => v.id, (a: A, b: B) => {
                const result = new TestResult(a.id, a.name, b.name);
                return result;
            });

            iter.forEach((v) => {
                resultSeq.push(v);
            });
        });

        it('expected result sequence', function () {
            assert.deepStrictEqual(resultSeq, [
                new TestResult(3, 'c', 'g'),
                new TestResult(3, 'c', 'h'),
                new TestResult(3, 'd', 'g'),
                new TestResult(3, 'd', 'h'),
            ]);
        });
    });

    describe('don\'t re-iterate again after completed', () => {
        let result1: boolean;
        let result2: boolean;

        before(() => {
            const outer = ExIterable.create([]);
            const inner = ExIterable.create([]);
            const src = outer.join<never, undefined, undefined>(inner, (_) => undefined, () => undefined, (_1, _2) => undefined);
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
});
