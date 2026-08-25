import { CLAIM_SQUARE, reducer, State } from './gameboard.reducer';
import { PLAYER_O, PLAYER_X } from './player';

describe('GameBoard reducer', function (): void {
    it('returns the initial state', function (): void {
        const newState = reducer();
        expect(newState).toEqual({
            squares: [
                [undefined, undefined, undefined],
                [undefined, undefined, undefined],
                [undefined, undefined, undefined],
            ],
        });
    });

    describe('claiming a square:', function (): void {
        it('allows a square to be claimed by a player', function (): void {
            const action = {
                type: CLAIM_SQUARE,
                payload: {
                    row: 0,
                    column: 0,
                    player: PLAYER_X,
                },
            };
            const initialState = reducer();
            const newState = reducer(initialState, action);
            expect(newState).toEqual({
                ...initialState,
                squares: [
                    [PLAYER_X, undefined, undefined],
                    [undefined, undefined, undefined],
                    [undefined, undefined, undefined],
                ],
            });

            let nextState = reducer(newState, {
                type: CLAIM_SQUARE,
                payload: {
                    row: 0,
                    column: 1,
                    player: PLAYER_O,
                },
            });
            expect(nextState).toEqual({
                ...initialState,
                squares: [
                    [PLAYER_X, PLAYER_O, undefined],
                    [undefined, undefined, undefined],
                    [undefined, undefined, undefined],
                ],
            });

            nextState = reducer(nextState, {
                type: CLAIM_SQUARE,
                payload: {
                    row: 2,
                    column: 2,
                    player: PLAYER_O, // the reducer doesn't care whose turn it is!
                },
            });
            expect(nextState).toEqual({
                ...initialState,
                squares: [
                    [PLAYER_X, PLAYER_O, undefined],
                    [undefined, undefined, undefined],
                    [undefined, undefined, PLAYER_O],
                ],
            });
        });

        it('throws an error if the row is out of bounds', function (): void {
            const initialState = reducer();
            expect(() => reducer(initialState, {
                type: CLAIM_SQUARE,
                payload: {
                    row: -1,
                    column: 0,
                    player: PLAYER_X,
                },
            })).toThrow(`${CLAIM_SQUARE}: row out of bounds`);

            expect(() => reducer(initialState, {
                type: CLAIM_SQUARE,
                payload: {
                    row: 3,
                    column: 0,
                    player: PLAYER_X,
                },
            })).toThrow(`${CLAIM_SQUARE}: row out of bounds`);
        });

        it('throws an error if the column is out of bounds', function (): void {
            const initialState = reducer();
            expect(() => reducer(initialState, {
                type: CLAIM_SQUARE,
                payload: {
                    row: 0,
                    column: -1,
                    player: PLAYER_X,
                },
            })).toThrow(`${CLAIM_SQUARE}: column out of bounds`);

            expect(() => reducer(initialState, {
                type: CLAIM_SQUARE,
                payload: {
                    row: 0,
                    column: 3,
                    player: PLAYER_X,
                },
            })).toThrow(`${CLAIM_SQUARE}: column out of bounds`);
        });

        it('throws if an invalid player tries to claim the square', function (): void {
            const initialState = reducer();
            expect(() => reducer(initialState, {
                type: CLAIM_SQUARE,
                payload: {
                    row: 0,
                    column: 1,
                    player: 'NOT_A_PLAYER',
                },
            })).toThrow(`${CLAIM_SQUARE}: invalid player`);
        });

        it('does not permit a claimed square to be claimed by another player', function (): void {
            const initialState = reducer();
            const state = {
                ...initialState,
                squares: [
                    [PLAYER_X, undefined, PLAYER_O],
                    [undefined, undefined, undefined],
                    [undefined, undefined, undefined],
                ],
            } satisfies State;
            const action = {
                type: CLAIM_SQUARE,
                payload: {
                    row: 0,
                    column: 2,
                    player: PLAYER_X,
                },
            };
            expect(reducer(state, action)).toEqual(state);
        });
    });
});