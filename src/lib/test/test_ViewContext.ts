import * as assert from 'assert';
import {ViewContextStack} from '../ViewContext';

class ResultData {

    isCalled: boolean;
    arg: any; // tslint:disable-line:no-any

    constructor() {
        this.isCalled = false;
        this.arg = undefined;
        Object.seal(this);
    }

    destroy(): void {
        this.isCalled = false;
        this.arg = undefined;
        Object.freeze(this);
    }
}

class TestContext {

    activateData: ResultData;
    destroyData: ResultData;
    suspendData: ResultData;
    resumeData: ResultData;

    constructor() {
        this.activateData = new ResultData();
        this.destroyData = new ResultData();
        this.suspendData = new ResultData();
        this.resumeData = new ResultData();
    }

    onActivate(arg: any) { // tslint:disable-line:no-any
        const data = this.activateData;
        data.isCalled = true;
        data.arg = arg;
    }

    onDestroy(arg: any) { // tslint:disable-line:no-any
        const data = this.destroyData;
        data.isCalled = true;
        data.arg = arg;
    }

    onSuspend(arg: any) { // tslint:disable-line:no-any
        const data = this.suspendData;
        data.isCalled = true;
        data.arg = arg;
    }

    onResume(arg: any) { // tslint:disable-line:no-any
        const data = this.resumeData;
        data.isCalled = true;
        data.arg = arg;
    }

    destroy() {
        this.activateData.destroy();
        this.destroyData.destroy();
        this.suspendData.destroy();
        this.resumeData.destroy();
    }
}

describe('ContextStack', function(){

    describe('current()', function(){
        describe('none value', function() {
            let stack: ViewContextStack;

            before(function(){
                stack = new ViewContextStack(document.body);
            });

            after(function(){
                stack.destroy();
            });

            it('current() returns the current context', function () {
                const result = stack.current();
                assert.strictEqual(result, undefined);
            });
        });

        describe('some value', function () {
            let stack: ViewContextStack;
            const expected = new TestContext();

            before(function(){
                stack = new ViewContextStack(document.body);
                stack.push(expected);
            });

            after(function(){
                stack.destroy();
            });

            it('current() returns the current context', function () {
                const result = stack.current();
                assert.strictEqual(result, expected);
            });
        });
    });

    describe('push()', function(){
        describe('with old context', function(){
            let stack: ViewContextStack;
            let old = new TestContext();
            let next = new TestContext();

            before(function(){
                stack = new ViewContextStack(document.body);
                stack.push(old);
                stack.push(next);
            });

            after(function(){
                stack.destroy();
                old.destroy();
                next.destroy();
            });

            it('old.onSuspend should be called', function () {
                assert.strictEqual(old.suspendData.isCalled, true);
            });

            it('the arguments for old.onSuspend', function () {
                assert.strictEqual(old.suspendData.arg, document.body);
            });

            it('next.onActivate should be called', function () {
                assert.strictEqual(next.activateData.isCalled, true);
            });

            it('the arguments for next.onActivate', function () {
                assert.strictEqual(next.activateData.arg, document.body);
            });
        });

        describe('with only the new context', function(){
            let stack: ViewContextStack;
            let next = new TestContext();

            before(function(){
                stack = new ViewContextStack(document.body);
                stack.push(next);
            });

            after(function(){
                stack.destroy();
                next.destroy();
            });

            it('next.onActivate should be called', function () {
                assert.strictEqual(next.activateData.isCalled, true);
            });

            it('the arguments for next.onActivate', function () {
                assert.strictEqual(next.activateData.arg, document.body);
            });
        });
    });

    describe('pop()', function(){
        describe('some context are stacked', function(){
            let stack: ViewContextStack;
            let old = new TestContext();
            let next = new TestContext();

            before(function(){
                stack = new ViewContextStack(document.body);
                stack.push(old);
                stack.push(next);

                stack.pop();
            });

            after(function(){
                stack.destroy();
                old.destroy();
                next.destroy();
            });

            it('old.onResume should be called', function () {
                assert.strictEqual(old.resumeData.isCalled, true);
            });

            it('the arguments for old.onResume', function () {
                assert.strictEqual(old.resumeData.arg, document.body);
            });

            it('next.onDestroy should be called', function () {
                assert.strictEqual(next.destroyData.isCalled, true);
            });

            it('the arguments for next.onDestroy', function () {
                assert.strictEqual(next.destroyData.arg, document.body);
            });
        });

        describe('the curren context is only stacked', function(){
            let stack: ViewContextStack;
            let next = new TestContext();

            before(function(){
                stack = new ViewContextStack(document.body);
                stack.push(next);
                stack.pop();
            });

            after(function(){
                stack.destroy();
                next.destroy();
            });

            it('next.onDestroy should be called', function () {
                assert.strictEqual(next.destroyData.isCalled, true);
            });

            it('the arguments for next.onDestroy', function () {
                assert.strictEqual(next.destroyData.arg, document.body);
            });
        });

        describe('the curren context is only stacked', function() {
            let stack: ViewContextStack;

            before(function(){
                stack = new ViewContextStack(document.body);
            });

            after(function(){
                stack.destroy();
            });


            it('do not raise any error.', function () {
                stack.pop();
                assert.ok(true);
            });
        });
    });

    describe('replace()', function(){
        describe('with old context', function(){
            let stack: ViewContextStack;
            let old = new TestContext();
            let next = new TestContext();

            before(function(){
                stack = new ViewContextStack(document.body);
                stack.push(old);
                stack.replace(next);
            });

            after(function(){
                stack.destroy();
                old.destroy();
                next.destroy();
            });

            it('old.onDestroy should be called', function () {
                assert.strictEqual(old.destroyData.isCalled, true);
            });

            it('the arguments for old.onDestroy', function () {
                assert.strictEqual(old.destroyData.arg, document.body);
            });

            it('next.onActivate should be called', function () {
                assert.strictEqual(next.activateData.isCalled, true);
            });

            it('the arguments for next.onActivate', function () {
                assert.strictEqual(next.activateData.arg, document.body);
            });
        });

        describe('no old context', function(){
            let stack: ViewContextStack;
            let next = new TestContext();

            before(function(){
                stack = new ViewContextStack(document.body);
                stack.replace(next);
            });

            after(function(){
                stack.destroy();
                next.destroy();
            });

            it('next.onActivate should be called', function () {
                assert.strictEqual(next.activateData.isCalled, true);
            });

            it('the arguments for next.onActivate', function () {
                assert.strictEqual(next.activateData.arg, document.body);
            });

        });
    });

    describe('destroy', function(){
        let stack: ViewContextStack;
        let c1 = new TestContext();
        let c2 = new TestContext();

        before(function(){
            stack = new ViewContextStack(document.body);
            stack.push(c1);
            stack.push(c2);

            stack.destroy();
        });

        after(function(){
            c1.destroy();
            c2.destroy();
        });

        it('c1.onDestroy should be called', function () {
            assert.strictEqual(c1.destroyData.isCalled, true);
        });

        it('the arguments for c1.onDestroy', function () {
            assert.strictEqual(c1.destroyData.arg, document.body);
        });

        it('c2.onDestroy should be called', function () {
            assert.strictEqual(c2.destroyData.isCalled, true);
        });

        it('the arguments for c2.onDestroy', function () {
            assert.strictEqual(c2.destroyData.arg, document.body);
        });

        it('mountPoint should be undefined', function () {
            assert.strictEqual(stack.mountpoint(), undefined);
        });

        it('the destroied stack should be freeze', function () {
            assert.ok(Object.isFrozen(stack));
        });
    });
});
