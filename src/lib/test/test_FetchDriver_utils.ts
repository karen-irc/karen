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
