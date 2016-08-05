// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
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
