import * as assert from 'assert';

import {
    Optional,
    Nullable,
    Maybe,

    isUndefined,
    isNotUndefined,

    isNull,
    isNotNull,

    isSomeValue,
    isNoneValue,
} from '../Nullable';

describe('type alias for a nullable data', () => {
    describe('Optional<T>', () => {
        describe('isUndefined()', () => {
            it('value is `undefined`', () => {
                const v: Optional<number> = undefined;
                assert.strictEqual(isUndefined(v), true);
            });

            it('value is not `undefined`', () => {
                const v: Optional<number> = 1;
                assert.strictEqual(isUndefined(v), false);
            });

            it('value is `null`', () => {
                const v: Optional<null> = null;
                assert.strictEqual(isUndefined(v), false);
            });
        });

        describe('isNotUndefined()', () => {
            it('value is `undefined`', () => {
                const v: Optional<number> = undefined;
                assert.strictEqual(isNotUndefined(v), false);
            });

            it('value is not `undefined`', () => {
                const v: Optional<number> = 1;
                assert.strictEqual(isNotUndefined(v), true);
            });

            it('value is `null`', () => {
                const v: Optional<null> = null;
                assert.strictEqual(isNotUndefined(v), true);
            });
        });
    });

    describe('Nullable<T>', () => {
        describe('isNull()', () => {
            it('value is `null`', () => {
                const v: Nullable<number> = null;
                assert.strictEqual(isNull(v), true);
            });

            it('value is not `null`', () => {
                const v: Nullable<number> = 1;
                assert.strictEqual(isNull(v), false);
            });

            it('value is `undefined`', () => {
                const v: Nullable<undefined> = undefined;
                assert.strictEqual(isNull(v), false);
            });
        });

        describe('isNotNull()', () => {
            it('value is `null`', () => {
                const v: Nullable<number> = null;
                assert.strictEqual(isNotNull(v), false);
            });

            it('value is not `null`', () => {
                const v: Nullable<number> = 1;
                assert.strictEqual(isNotNull(v), true);
            });

            it('value is `undefined`', () => {
                const v: Nullable<undefined> = undefined;
                assert.strictEqual(isNotNull(v), true);
            });
        });
    });

    describe('Maybe<T>', () => {
        describe('isSomeValue()', () => {
            it('value is `null`', () => {
                const v: Maybe<number> = null;
                assert.strictEqual(isSomeValue(v), false);
            });

            it('value is not `null`', () => {
                const v: Maybe<number> = 1;
                assert.strictEqual(isSomeValue(v), true);
            });

            it('value is `undefined`', () => {
                const v: Maybe<number> = undefined;
                assert.strictEqual(isSomeValue(v), false);
            });
        });

        describe('isNoneValue()', () => {
            it('value is `null`', () => {
                const v: Maybe<number> = null;
                assert.strictEqual(isNoneValue(v), true);
            });

            it('value is not `null`', () => {
                const v: Maybe<number> = 1;
                assert.strictEqual(isNoneValue(v), false);
            });

            it('value is `undefined`', () => {
                const v: Maybe<number> = undefined;
                assert.strictEqual(isNoneValue(v), true);
            });
        });
    });
});
