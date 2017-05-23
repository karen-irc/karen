import * as assert from 'assert';

import { Option } from 'option-t/es6/Option';
import { Result, Ok, Err } from 'option-t/es6/Result';

import { unwrapResponseJson } from './FetchDriver';

/**
 *  This is a specifig helper function to handle:
 *
 *      - The response body is a json decodable.
 *      - You do not have to handle non ok (200~299) case.
 *      - __*You do not have to return a detailed error*__.
 *
 *  In following cases, you SHOULD NOT use this function.
 *  This function does not return any errors which you'd like know.
 *
 *      - If you'd like to handle more advance case.
 *      - You'd like to use this function at first.
 *          - You should use this function in a refactoring phase.
 *          - You MUST NOT use to write your code in non-refactoring phase.
 */
export function handleOkResponseToOption<T>(res: Response): Promise<Option<T>> {
    const result: Promise<Option<T>> = handleOkResponseToResult<T>(res)
        .then((result: Result<T, Error>) => result.ok());
    return result;
}

/**
 *  This is a specifig helper function to handle:
 *
 *      - The response body is a json decodable.
 *      - You do not have to handle non ok (200~299) case.
 *
 *  In following cases, you SHOULD NOT use this function.
 *  This function does not return any errors which you'd like know.
 *
 *      - If you'd like to handle more advance case.
 *      - You'd like to use this function at first.
 *          - You should use this function in a refactoring phase.
 *          - You MUST NOT use to write your code in non-refactoring phase.
 */
export function handleOkResponseToResult<T>(res: Response): Promise<Result<T, Error>> {
    if (res.ok) {
        const json = unwrapResponseJson<T>(res);
        const result: Promise<Result<T, Error>> = json
            .then((json: T) => {
                return new Ok<T, Error>(json);
            }, (err: Error) => {
                // XXX: Originally, this `err` is `any` type.
                // However, in this method chain, we can assume this `err` is `Error` type.
                // from the implementation.
                assert.ok(err instanceof Error, 'Violation: static type checking assumption');
                return new Err<T, Error>(err);
            });
        return result;
    }
    else {
        const error = new TypeError(res.statusText);
        return Promise.resolve(new Err<T, Error>(error));
    }
}
