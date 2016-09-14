import {
    Observable,
    Subject,
    Subscription,
} from 'rxjs';
import {ReactiveProperty} from './ReactiveProperty';

const enum TransitionType {
    Success,
    Failure,
}

type TransitionSucess<TState, TInput> = {
    type: TransitionType.Success,
    next: TState,
    input: Observable<TInput>,
};

type TransitionFailure<TState, TInput> = {
    type: TransitionType.Failure,
    from: TState,
    input: TInput,
    err: Error,
};

type TransitionResult<TState, TInput> = TransitionSucess<TState, TInput> | TransitionFailure<TState, TInput>;

function isTransitionSucess<TState, TInput>(v: TransitionResult<TState, TInput>): v is TransitionSucess<TState, TInput> {
    return v.type === TransitionType.Success;
}

type NextMapping<TState, TInput> = (state: TState, input: TInput) => {
    state: TState,
    input: Observable<TInput>;
};

/**
 *  Inspired by https://speakerdeck.com/inamiy/reactive-state-machine-japanese?slide=65
 */
export class Automaton<TState, TInput> {
    private _state: ReactiveProperty<TState>;
    private _disposer: Subscription;

    constructor(initial: TState, input: Observable<TInput>, mapping: NextMapping<TState, TInput>) {
        const state = new ReactiveProperty(initial);
        const nextState: Observable<TState> = transitionState(state.asObservable(), input, mapping);
        this._state = state;
        this._disposer = nextState.subscribe(state);
    }

    state(): ReactiveProperty<TState> {
        return this._state;
    }
}

function transitionState<TState, TInput>(state: Observable<TState>,
                                         input: Observable<TInput>,
                                         mapping: NextMapping<TState, TInput>): Observable<TState> {
    const inputPipe = new Subject<Observable<TInput>>();
    const nextInput: Observable<TInput> = inputPipe.flatMap((inner) => inner);
    const grandInput = input.merge<TInput>(nextInput);

    type Result = TransitionResult<TState, TInput>;
    type Success = TransitionSucess<TState, TInput>;

    const transition: Observable<Result> = grandInput
        .withLatestFrom(state, (input: TInput, from: TState) => {
            return {
                input,
                from,
            };
        }).map((container) => {
            return callStateMapper<TState, TInput>(mapping, container);
        });

    const postTransition: Observable<Result> = transition
        .do((result: Result) => {
            switch (result.type) {
                case TransitionType.Success:
                    inputPipe.next(result.input);
                    break;
                case TransitionType.Failure:
                    console.error(result);
                    break;
                default:
                    throw new RangeError('undefined TransitionType');
            }
        })
        .do((result: Result) => {
            let type: string;
            switch (result.type) {
                case TransitionType.Success:
                    type = 'Success';
                    break;
                case TransitionType.Failure:
                    type = 'Failure';
                    break;
                default:
                    throw new RangeError('undefined TransitionType');
            }
            console.group();
                console.log(`type: ${type}`);
                console.dir(result);
            console.groupEnd();
        });

    const successTransition = postTransition.filter<Result, Success>(isTransitionSucess);

    return successTransition.map((container) => {
        if (container.type === TransitionType.Success) {
            return container.next;
        }
        else {
            throw new TypeError('unreachable');
        }
    });
}

function callStateMapper<TState, TInput>(mapping: NextMapping<TState, TInput>,
                                         container: { from: TState, input: TInput }): TransitionResult<TState, TInput> {
    const { input, from, } = container;
    let next: {
        state: TState,
        input: Observable<TInput>;
    };
    try {
        next = mapping(from, input);
    }
    catch (err) {
        return {
            type: TransitionType.Failure,
            from,
            input,
            err,
        } as TransitionFailure<TState, TInput>;
    }

    return {
        type: TransitionType.Success,
        next: next.state,
        input: next.input,
    } as TransitionSucess<TState, TInput>;
}
