import { Nullable } from 'option-t/es6/Nullable';
import { Option, Some, None } from 'option-t/es6/Option';
import { Result } from 'option-t/es6/Result';

import { Observable } from 'rxjs/Observable';

import { toResult } from './OptionUtils';

/**
 *  The utility wrapper object to express what this is in progress or result.
 *
 *  We need to express "in progress" on building an rich GUI. However,
 *  React v15 does not handle `Promise` or `Observable` which is not resolved the state as
 *  regard as "in progress" value.
 *
 *  This object is the solution for it.
 */
export class ProgressResult<T, E> {

    readonly isProgress: boolean;
    private _val: Option<Result<T, E>>;

    /**
     *  If you pass the `null`, this object is created as "in progress".
     *  Otherwise, this object is created as the completed one with the result.
     */
    constructor(val: Nullable<Result<T, E>>) {
        if (val === null) {
            this.isProgress = true;
            this._val = new None<Result<T, E>>();
        }
        else {
            this.isProgress = false;
            this._val = new Some<Result<T, E>>(val);
        }
    }

    value(): Option<Result<T, E>> {
        return this._val;
    }

    unwrap(): Result<T, E> | never {
        return this._val.expect('ProgressResult: this is in progress');
    }
}

/**
 *  This is the option version of `ProgressResult`.
 *
 *  In almost case, GUI View requires the feedback of why the error happens.
 *  So you should use ProgressResult instead of this basically.
 */
export class ProgressOption<T> {

    readonly isProgress: boolean;
    private _val: Option<T>;

    /**
     *  If you pass the `null`, this object is created as "in progress".
     *  Otherwise, this object is created as the completed one with the result.
     */
    constructor(val: Option<T> | null) {
        if (val === null) {
            this.isProgress = true;
            this._val = new None<T>();
        }
        else {
            this.isProgress = false;
            this._val = val;
        }
    }

    /**
     *  XXX: This option returns `None` if this is in progress.
     */
    value(): Option<T> {
        return this._val;
    }
}

export function fromOptionToProgressResult<T>(src: Option<T>): ProgressResult<T, void> {
    const v: Result<T, void> = toResult(src);
    return new ProgressResult(v);
}

export function startWithInProgressResult<T, E>(src: Observable<Result<T, E>>): Observable<ProgressResult<T, E>> {
    const first = new ProgressResult<T, E>(null);
    const o = src
        .map((v: Result<T, E>) => {
            return new ProgressResult<T, E>(v);
        }).startWith(first);
    return o;
}
