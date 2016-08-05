// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as assert from 'assert';

import * as testConfig from '../../../config/test_config';
import {FetchDriver, assertForbiddenError} from '../FetchDriver';

describe('FetchDriver::utils', function () {
    describe('FetchDriver.origin()', function () {
        const ORIGIN = String(testConfig.origin.FIRST);
        let driver: FetchDriver;

        before(() => {
            driver = new FetchDriver(ORIGIN);
        });

        after(() => {
            driver = undefined as any; // tslint:disable-line:no-any
        });

        it('should be the expected', () => {
            assert.strictEqual(driver.origin(), ORIGIN);
        });
    });

    describe('assertForbiddenError', function () {

        function shouldFulfilled(result: Promise<Response>): Promise<void> {
            return result.then(() => {
                assert.ok(true);
            }, () => {
                assert.ok(false, 'should be fulfilled');
            });
        }

        function shouldRejected(result: Promise<Response>): Promise<void> {
            return result.then(() => {
                assert.ok(false, 'should be rejected');
            }, () => {
                assert.ok(true);
            });
        }

        const statusCodeList: Array<number> = [];
        for (let start = 200, max = (600 - start), i = start; statusCodeList.push(i++) < max;) {}

        for (let status of statusCodeList) {
            it('http status: '+ String(status), (): Promise<void> => {
                const res = new Response(undefined, {
                    status: status,
                });
                const result = assertForbiddenError(res);
                if (status === 403) {
                    return shouldRejected(result);
                }
                else {
                    return shouldFulfilled(result);
                }
            });
        }
    });
});
