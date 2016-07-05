/**
 * MIT License
 *
 * Copyright (c) 2015 Tetsuharu OHZEKI <saneyuki.snyk@gmail.com>
 * Copyright (c) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
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

import * as testConfig from '../../../../../config/test_config';

import {FetchDriver} from '../FetchDriver';

interface ResBody {
    origin: string;
    method: string;
}

const PATH = '/api/fetchdriver/get';

describe('FetchDriver.fetch()', function () {
    const origin = String(testConfig.origin.FIRST);
    let driver: FetchDriver;

    before(() => {
        driver = new FetchDriver(origin);
    });

    after(() => {
        driver = undefined as any;
    });

    describe('valid case', function () {
        let res: Response | void;
        let body: Promise<ResBody> | void;

        before(() => {
            const req = driver.createRequest(PATH, {
                method: 'GET',
            });

            return driver.fetch(req).then((result: Response) => {
                res = result;
                body = result.json();
            });
        });

        after(() => {
            res = undefined;
            body = undefined;
        });

        it('the expected status code', () => {
            assert.strictEqual(res.status, 200);
        });

        it('use the expected method', () => {
            return body.then((body) => {
                assert.strictEqual(body.method.toLowerCase(), 'get');
            });
        });

        it('request to the expected origin', () => {
            return body.then((body) => {
                const expected = String(testConfig.origin.FIRST);
                assert.strictEqual(body.origin, expected);
            });
        });
    });

    describe('invalid case', function () {
        describe('Don\'t pass the request to another origin', () => {
            let err: URIError | void = undefined;

            before(() => {
                const another = String(testConfig.origin.SECOND);
                const anotherDriver = new FetchDriver(another);
                const req = anotherDriver.createRequest(PATH, {
                    method: 'GET',
                });

                try {
                    driver.fetch(req);
                }
                catch (e) {
                    err = e;
                }
            });

            after(() => {
                err = undefined;
            });

            it('should throw the expected error', () => {
                assert.notStrictEqual(err, undefined);
            });

            it('should throw the expected error type', () => {
                assert.strictEqual(err instanceof URIError, true);
            });

            it('should throw the expected message', () => {
                assert.strictEqual(err.message, 'the passed input\'s origin is different from this driver\'s one.');
            });
        });
    });
});
