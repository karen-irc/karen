import * as assert from 'assert';
import {ExIterable} from '../../ExIterable';

import {getIterator} from '../../util';

class Node {
    readonly id: number;
    readonly children: Array<Node>;
    constructor(id: number, children: Array<Node>) {
        this.id = id;
        this.children = children;
    }
}

describe('ExIterable.expand()', function () {
    describe('don\'t re-iterate again after completed', () => {
        let result1: boolean;
        let result2: boolean;

        before(() => {
            const src = ExIterable.create([]).expand(() => []);
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

        before(function () {
            const iter = ExIterable.create<Node>([
                    new Node(0, []),
                    new Node(1, [
                        new Node(2, [
                            new Node(4, []),
                            new Node(5, []),
                        ]),
                        new Node(3, [
                            new Node(6, []),
                            new Node(7, [
                                new Node(9, []),
                            ]),
                            new Node(8, [
                                new Node(10, []),
                            ]),
                        ]),
                    ]),
                ])
                .expand((node: Node) => node.children);
            iter.forEach((v: Node) => {
                resultSeq.push(v.id);
            });
        });

        it('expected result sequence', function () {
            assert.deepStrictEqual(resultSeq, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });
    });
});
