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
type Origin = string;

export class FetchDriver {
    private _origin: Origin;

    constructor(origin: Origin) {
        this._origin = origin;
    }

    get(this: FetchDriver, path: string, option: RequestInit): Promise<Response> {
        option.method = 'GET';
        return this._fetchToUrl(path, option);
    }

    post(this: FetchDriver, path: string, option: RequestInit): Promise<Response> {
        option.method = 'POST';
        return this._fetchToUrl(path, option);
    }

    private _fetchToUrl(this: FetchDriver, path: string, option: RequestInit): Promise<Response> {
        const url = this._origin + path;
        const req = self.fetch(url, option);
        return req;
    }

    fetch(this: FetchDriver, input: Request): Promise<Response> {
        assertOrigin(this._origin, input);
        const req = self.fetch(input, {});
        return req;
    }

    createRequest(this: FetchDriver, path: string, init: RequestInit): Request {
        const url = this._origin + path;
        const req = new Request(url, init);
        return req;
    }
}

function assertOrigin(origin: Origin, input: Request): void | never {
    if (!input.url.startsWith(origin)) {
        throw new URIError('the passed input\'s origin is different from this driver\'s one.');
    }
}

const enum HttpStatus {
    Forbidden = 403,
}

export function assertForbiddenError(res: Response): Promise<Response> {
    if (res.status === HttpStatus.Forbidden) {
        return Promise.reject<Response>(res);
    }
    else {
        return Promise.resolve(res);
    }
}

export function unwrapResponseJson<T>(res: Response): Promise<T> {
    return res.json<T>();
}
