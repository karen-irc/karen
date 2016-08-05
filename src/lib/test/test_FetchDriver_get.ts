// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as assert from 'assert';

import {FetchDriver} from '../FetchDriver';
import * as testConfig from '../../../config/test_config';

interface ResBody {
    origin: string;
    method: string;
}

const PATH = 'api/fetchdriver/get';

describe('FetchDriver.get()', function () {
    describe('same origin', function () {
        let driver: FetchDriver;
        before(() => {
            const origin = String(testConfig.origin.FIRST);
            driver = new FetchDriver(origin);
        });

        after(() => {
            driver = undefined as any; // tslint:disable-line:no-any
        });

        describe('valid case', () => {
            let res: Response | void;
            let body: Promise<ResBody> | void;

            before(() => {
                return driver.get('/' + PATH, {}).then((result: Response) => {
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

        describe('`path` does not starts with `/`', () => {
            let err: SyntaxError | void = undefined;

            before(() => {
                try {
                    driver.get(PATH, {});
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
                assert.strictEqual(err instanceof SyntaxError, true);
            });

            it('should throw the expected message', () => {
                assert.strictEqual(err.message, '`path` should starts with `/`');
            });
        });

        describe('Don\'t request to another origin', () => {
            let err: SyntaxError | void = undefined;

            before(() => {
                try {
                    driver.get(testConfig.origin.SECOND + '/' + PATH, {});
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
                assert.strictEqual(err instanceof SyntaxError, true);
            });
        });
    });

    describe('cross origin', function () {
        let driver: FetchDriver;
        before(() => {
            const origin = String(testConfig.origin.SECOND);
            driver = new FetchDriver(origin);
        });

        after(() => {
            driver = undefined as any; // tslint:disable-line:no-any
        });

        describe('valid case', () => {
            let res: Response | void;
            let body: Promise<ResBody> | void;

            before(() => {
                return driver.get('/' + PATH, {
                    mode: 'cors'
                }).then((result: Response) => {
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
                    const expected = String(testConfig.origin.SECOND);
                    assert.strictEqual(body.origin, expected);
                });
            });
        });

        describe('`path` does not starts with `/`', () => {
            let err: SyntaxError | void = undefined;

            before(() => {
                try {
                    driver.get(PATH, {
                        mode: 'cors'
                    });
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
                assert.strictEqual(err instanceof SyntaxError, true);
            });

            it('should throw the expected message', () => {
                assert.strictEqual(err.message, '`path` should starts with `/`');
            });
        });

        describe('Don\'t request to another origin', () => {
            let err: SyntaxError | void = undefined;

            before(() => {
                try {
                    driver.get(testConfig.origin.FIRST + '/' + PATH, {});
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
                assert.strictEqual(err instanceof SyntaxError, true);
            });
        });
    });
});
