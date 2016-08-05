// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
import * as assert from 'assert';

import {origin} from '../../../config/test_config';

import {FetchDriver} from '../FetchDriver';


describe('FetchDriver.createRequest', function () {
    let driver: FetchDriver;

    before(() => {
        driver = new FetchDriver(String(origin.FIRST));
    });

    describe('input is url string', function () {
        let req: Request;

        before(() => {
            req = driver.createRequest('/bar', {});
        });

        it('request.url', () => {
            assert.strictEqual(req.url, String(origin.FIRST) + '/bar');
        });
    });
});
