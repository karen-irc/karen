import { Option } from 'option-t/es6/Option';
import { Result, Ok, Err } from 'option-t/es6/Result';

export function toResult<T>(o: Option<T>): Result<T, void> {
    return o.mapOrElse(() => {
        return new Err<T, void>(undefined);
    }, (v: T) => {
        return new Ok<T, void>(v);
    });
}

export function stripErrorFromResult<T>(o: Option<Result<T, void>>): Option<T> {
    const r = o.flatMap((v: Result<T, void>) => {
        return v.ok();
    });
    return r;
}
