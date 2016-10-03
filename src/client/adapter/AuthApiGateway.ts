import {
    FetchDriver,
    MimeType,
} from '../../lib/FetchDriver';

const defaultHeaders: HeadersInit = {
    'Content-Type': MimeType.JSON,
    Accept: MimeType.JSON,
};

const BASE_PATH = '/api/auth';

export class AuthApiGateway {

    private _driver: FetchDriver;

    constructor(driver: FetchDriver) {
        this._driver = driver;
    }

    signin(id: string, password: string): Promise<boolean> {
        const json = JSON.stringify({
            id,
            password,
        });
        const res = this._driver.post(BASE_PATH + '/signin', {
            headers: defaultHeaders,
            body: json,
        });
        return res.then((res) => res.ok);
    }

    signout(): Promise<boolean> {
        const res = this._driver.get(BASE_PATH + '/signout', {
            headers: defaultHeaders,
        });

        return res.then((res) => res.ok);
    }
}
