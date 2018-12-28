import * as assert from 'assert';
import {
    Observable,
    Subject,
} from 'rxjs';

import {Automaton} from '../RxAutomaton';

describe('RxAutomaton', () => {

    describe('Automaton', () => {
        describe('state()', () => {

            describe('get initial state', () => {
                const INITIAL_STATE = 0;

                let resultBySubscribe: number;
                let resultByGetter: number;

                before((done) => {
                    const input = new Subject<number>();
                    const m = new Automaton<number, number>(INITIAL_STATE, input, (state: number, _: number) => {
                        return {
                            state,
                            input: Observable.empty<number>(),
                        };
                    });

                    const state = m.state();
                    resultByGetter = state.value();
                    state.asObservable().subscribe((state) => {
                        resultBySubscribe = state;
                    }, done, done);

                    state.complete();
                });

                it('initial state from subscription', () => {
                    assert.deepStrictEqual(resultBySubscribe, INITIAL_STATE);
                });

                it('initial state from getter', () => {
                    assert.deepStrictEqual(resultByGetter, INITIAL_STATE);
                });
            });

            describe('set state from outer', () => {
                const seq: Array<number> = [];
                const mapperSeq: Array<number> = [];

                before((done) => {
                    const input = new Subject<number>();
                    const m = new Automaton<number, number>(0, input, (state: number, _: number) => {
                        mapperSeq.push(state);

                        return {
                            state,
                            input: Observable.empty<number>(),
                        };
                    });

                    const state = m.state();
                    state.asObservable().subscribe((state) => {
                        seq.push(state);
                    }, done, done);

                    state.setValue(1);
                    state.setValue(2);
                    state.setValue(3);
                    state.complete();
                });

                it('state should be updated', () => {
                    assert.deepStrictEqual(seq, [0, 1, 2, 3]);
                });

                it('mapper should not call', () => {
                    assert.deepStrictEqual(mapperSeq, []);
                });
            });
        });
    });
});
