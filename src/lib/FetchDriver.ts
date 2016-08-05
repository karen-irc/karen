// https://github.com/karen-irc/karen/blob/master/LICENSE.txt
type Origin = string;

export class FetchDriver {
    private _origin: Origin;

    /**
     *  @param  origin
     *      This must be formed following patterns:
     *          - https://www.example.com
     *          - http://www.example.com:8000
     */
    constructor(origin: Origin) {
        this._origin = origin;
    }

    origin(): Origin {
        return this._origin;
    }

    get(path: string, option: RequestInit): Promise<Response> {
        option.method = 'GET';
        return this._fetchToUrl(path, option);
    }

    post(path: string, option: RequestInit): Promise<Response> {
        option.method = 'POST';
        return this._fetchToUrl(path, option);
    }

    private _fetchToUrl(path: string, option: RequestInit): Promise<Response> {
        if (!path.startsWith('/')) {
            throw new SyntaxError('`path` should starts with `/`');
        }

        const url = this._origin + path;
        const req = self.fetch(url, option);
        return req;
    }

    fetch(input: Request): Promise<Response> {
        assertOrigin(this._origin, input);
        const req = self.fetch(input, {});
        return req;
    }

    createRequest(path: string, init: RequestInit): Request {
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
