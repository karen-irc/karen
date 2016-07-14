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
/*eslint-env mocha */
import * as assert from 'assert';
import{MessageTextNode, MessageUriNode} from '../MessageNode';
import {parseToMessageNode} from '../parseToMessageNode';

describe('MessageNode', function () {

    describe('parseString', () => {
        it('1', () => {
            const src = '';
            const result = parseToMessageNode(src);
            assert.deepStrictEqual(result.children, []);
        });

        it('2', () => {
            const src = '123';
            const result = parseToMessageNode(src);
            assert.deepStrictEqual(result.children, [
                new MessageTextNode(src),
            ]);
        });

        it('3', () => {
            const src = '123 http://www.google.com';
            const result = parseToMessageNode(src);
            assert.deepStrictEqual(result.children, [
                new MessageTextNode('123 '),
                new MessageUriNode('http://www.google.com'),
            ]);
        });

        it('4', () => {
            const src = '123http://www.google.com';
            const result = parseToMessageNode(src);
            assert.deepStrictEqual(result.children, [
                new MessageTextNode('123http://'),
                new MessageUriNode('www.google.com'),
            ]);
        });

        it('5', () => {
            const src = 'http://www.google.com 123';
            const result = parseToMessageNode(src);
            assert.deepStrictEqual(result.children, [
                new MessageUriNode('http://www.google.com'),
                new MessageTextNode(' 123'),
            ]);
        });

        it('6', () => {
            const src = '123 http://www.google.com 123';
            const result = parseToMessageNode(src);
            assert.deepStrictEqual(result.children, [
                new MessageTextNode('123 '),
                new MessageUriNode('http://www.google.com'),
                new MessageTextNode(' 123'),
            ]);
        });

        it('7', () => {
            const src = 'http://www.google.com http://www.google.com';
            const result = parseToMessageNode(src);
            assert.deepStrictEqual(result.children, [
                new MessageUriNode('http://www.google.com'),
                new MessageTextNode(' '),
                new MessageUriNode('http://www.google.com'),
            ]);
        });
    });
});
