// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as assert from 'assert';

import * as testConfig from '../../../config/test_config';

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
        driver = undefined as any; // tslint:disable-line:no-any
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

        describe('Don\'t pass the request which is not formatted as origin + path', () => {
            let err: URIError | void = undefined;

            before(() => {
                const req = new Request(PATH, {
                    method: 'GET'
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
        });
    });
});
