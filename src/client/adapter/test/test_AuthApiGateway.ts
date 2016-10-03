import * as assert from 'assert';

import {origin} from '../../../../config/test_config';
import {FetchDriver} from '../../../lib/FetchDriver';

import {AuthApiGateway} from '../AuthApiGateway';


describe('AuthApiGateway', function () {
    let gateway: AuthApiGateway;

    before(() => {
        const driver = new FetchDriver(String(origin.FIRST));
        gateway = new AuthApiGateway(driver);
    });

    describe('signin()', function () {
        it('check all parameters are requested', async () => {
            const id = 'id';
            const pass = 'pass';
            const res = await gateway.signin(id, pass);
            assert.strictEqual(res, true);
        });
    });

    describe('signout()', function () {
        it('check all parameters are requested', async () => {
            const res = await gateway.signout();
            assert.strictEqual(res, true);
        });
    });
});
