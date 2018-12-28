import * as Rx from 'rxjs';
import {Automaton} from '../lib/RxAutomaton';

// tslint:disable-next-line: no-namespace
declare global {
    interface Window {
        auto: Automaton<State, Input>;
        input: Rx.Subject<number>;
    }
}

const input = new Rx.Subject<number>();

interface State {
    current: number;
}

const enum OpCode {
    Increment,
    Decrement,
}

interface Input {
    type: OpCode;
    value: number;
}

const inputStream = input.map((value): Input => {
    return {
        type: OpCode.Increment,
        value,
    };
});

window.auto = new Automaton<State, Input>({ current: 0 }, inputStream, (state: State, input: Input) => {
    switch (input.type) {
        case OpCode.Increment:
            return {
                state: {
                    current: state.current + input.value,
                },
                input: Rx.Observable.of<Input>({
                    type: OpCode.Decrement,
                    value: input.value,
                }).delay(500),
            };

        case OpCode.Decrement:
            return {
                state: {
                    current: state.current - input.value,
                },
                input: Rx.Observable.empty<Input>(),
            };
    }
});

window.auto.state().asObservable().subscribe((state) => {
    console.log(`new state: ${state.current}`);
}, (e) => {
    console.error(e);
});

window.input = input;

input.next(1);
