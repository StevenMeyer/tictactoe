import { reducer, State } from '../Game/game.reducer';
import { CLAIM_SQUARE } from '../GameBoard/claimSquareAction';
import { PLAYER_O, PLAYER_X } from '../GameBoard/player';
import { GameStatus, WinType } from '../GameBoard/status';

describe('Game reducer', function (): void {
    it('returns the initial state', function (): void {
        const newState = reducer();
        expect(newState).toEqual({
            currentPlayer: PLAYER_X,
            squares: [
                [undefined, undefined, undefined],
                [undefined, undefined, undefined],
                [undefined, undefined, undefined],
            ],
            status: GameStatus.IN_PROGRESS,
            wins: [],
        });
    });

    describe('claiming a square:', function (): void {
        it('allows a square to be claimed by a player', function (): void {
            const action = {
                type: CLAIM_SQUARE,
                payload: {
                    row: 0,
                    column: 0,
                },
            };
            const initialState = reducer();
            const newState = reducer(initialState, action);
            expect(newState).toEqual({
                ...initialState,
                currentPlayer: PLAYER_O, // player was changed to PLAYER_O
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
                },
            });
            expect(nextState).toEqual({
                ...initialState,
                currentPlayer: PLAYER_X,
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
                },
            });
            expect(nextState).toEqual({
                ...initialState,
                currentPlayer: PLAYER_O,
                squares: [
                    [PLAYER_X, PLAYER_O, undefined],
                    [undefined, undefined, undefined],
                    [undefined, undefined, PLAYER_X],
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
                },
            })).toThrow(`${CLAIM_SQUARE}: row out of bounds`);

            expect(() => reducer(initialState, {
                type: CLAIM_SQUARE,
                payload: {
                    row: 3,
                    column: 0,
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
                },
            })).toThrow(`${CLAIM_SQUARE}: column out of bounds`);

            expect(() => reducer(initialState, {
                type: CLAIM_SQUARE,
                payload: {
                    row: 0,
                    column: 3,
                },
            })).toThrow(`${CLAIM_SQUARE}: column out of bounds`);
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
                },
            };
            expect(reducer(state, action)).toEqual(state);
        });
    });

    describe('checking the game state:', function (): void {
        it('detects game in progress initially', function (): void {
            const initialState = reducer();
            expect(initialState.status).toBe(GameStatus.IN_PROGRESS);
            expect(initialState.wins).toEqual([]);
        });

        it('detects a winner when a player has claimed three squares in a row', function (): void {
            const initialState = {
                ...reducer(),
                currentPlayer: PLAYER_X as typeof PLAYER_X,
                squares: [
                    [PLAYER_X,  undefined, PLAYER_X],
                    [PLAYER_O,  PLAYER_O,  undefined],
                    [undefined, undefined, undefined],
                ] as const,
            };
            expect(reducer(initialState, {
                type: CLAIM_SQUARE,
                payload: {
                    row: 0, column: 1,
                }
            })).toEqual({
                ...initialState,
                currentPlayer: PLAYER_O,
                squares: [
                    [PLAYER_X,  PLAYER_X,  PLAYER_X],
                    [PLAYER_O,  PLAYER_O,  undefined],
                    [undefined, undefined, undefined],
                ],
                status: GameStatus.WINNER_PLAYER_X,
                wins: [{
                    type: WinType.ROW,
                    firstWinningSquare: {
                        row: 0,
                        column: 0,
                    },
                }]
            });
        });

        it('does not detect a winner when a row is full but with different players', function (): void {
            expect(reducer({
                ...reducer(),
                currentPlayer: PLAYER_X,
                squares: [
                    [PLAYER_X,  undefined, PLAYER_X],
                    [PLAYER_O,  PLAYER_O,  undefined],
                    [undefined, undefined, undefined],
                ],
            }, {
                type: CLAIM_SQUARE,
                payload: {
                    row: 1, column: 2,
                }
            }).status).toBe(GameStatus.IN_PROGRESS);
        });

        it('detects a winner when a player has claimed three squares in a column', function (): void {
            const initialState = {
                ...reducer(),
                currentPlayer: PLAYER_O as typeof PLAYER_O,
                squares: [
                    [PLAYER_X,  PLAYER_O, PLAYER_X],
                    [undefined, PLAYER_O, undefined],
                    [undefined, undefined, undefined],
                ] as const,
            };
            expect(reducer(initialState, {
                type: CLAIM_SQUARE,
                payload: {
                    row: 2, column: 1,
                }
            })).toEqual({
                ...initialState,
                currentPlayer: PLAYER_X,
                squares: [
                    [PLAYER_X,  PLAYER_O, PLAYER_X],
                    [undefined, PLAYER_O, undefined],
                    [undefined, PLAYER_O, undefined],
                ],
                status: GameStatus.WINNER_PLAYER_O,
                wins: [{
                    type: WinType.COLUMN,
                    firstWinningSquare: {
                        row: 0,
                        column: 1,
                    },
                }],
            });
        });

        it('does not detect a winner when a column is full but with different players', function (): void {
            expect(reducer({
                ...reducer(),
                currentPlayer: PLAYER_X,
                squares: [
                    [PLAYER_X,  PLAYER_O, PLAYER_X],
                    [undefined, PLAYER_O, undefined],
                    [undefined, undefined, undefined],
                ],
            }, {
                type: CLAIM_SQUARE,
                payload: {
                    row: 2, column: 1,
                }
            }).status).toBe(GameStatus.IN_PROGRESS);
        });

        it('detects a winner when a player has claimed three squares in a diagonal', function (): void {
            const initialState = {
                ...reducer(),
                currentPlayer: PLAYER_X as typeof PLAYER_X,
                squares: [
                    [PLAYER_X, PLAYER_O,  PLAYER_O],
                    [PLAYER_X, undefined, undefined],
                    [PLAYER_O, PLAYER_X,  PLAYER_X],
                ] as const,
            };

            expect(reducer(initialState, {
                type: CLAIM_SQUARE,
                payload: {
                    row: 1, column: 1,
                }
            })).toEqual({
                currentPlayer: PLAYER_O,
                squares: [
                    [PLAYER_X, PLAYER_O,  PLAYER_O],
                    [PLAYER_X, PLAYER_X,  undefined],
                    [PLAYER_O, PLAYER_X,  PLAYER_X],
                ],
                status: GameStatus.WINNER_PLAYER_X,
                wins: [{
                    type: WinType.DIAGONAL_TOP_LEFT,
                    firstWinningSquare: {
                        row: 0,
                        column: 0,
                    },
                }],
            });

            expect(reducer({
                ...initialState,
                currentPlayer: PLAYER_O,
            },
            {
                type: CLAIM_SQUARE,
                payload: {
                    row: 1, column: 1,
                }
            })).toEqual({
                currentPlayer: PLAYER_X,
                squares: [
                    [PLAYER_X, PLAYER_O,  PLAYER_O],
                    [PLAYER_X, PLAYER_O,  undefined],
                    [PLAYER_O, PLAYER_X,  PLAYER_X],
                ],
                status: GameStatus.WINNER_PLAYER_O,
                wins: [{
                    type: WinType.DIAGONAL_TOP_RIGHT,
                    firstWinningSquare: {
                        row: 0,
                        column: 2,
                    },
                }],
            });
        });

        it('detects multiple wins', function (): void {
            const initialState = {
                ...reducer(),
                currentPlayer: PLAYER_X as typeof PLAYER_X,
                squares: [
                    [PLAYER_X,  PLAYER_O, PLAYER_X],
                    [PLAYER_X,  PLAYER_X, PLAYER_O],
                    [undefined, PLAYER_X, PLAYER_X], // yes, this board should not exist; it's just a test
                ] as const,
            };

            expect(reducer(initialState, {
                type: CLAIM_SQUARE,
                payload: {
                    row: 2, column: 0,
                }
            })).toEqual({
                currentPlayer: PLAYER_O,
                squares: [
                    [PLAYER_X, PLAYER_O, PLAYER_X],
                    [PLAYER_X, PLAYER_X, PLAYER_O],
                    [PLAYER_X, PLAYER_X, PLAYER_X],
                ],
                status: GameStatus.WINNER_PLAYER_X,
                wins: expect.arrayContaining([{
                    type: WinType.ROW,
                    firstWinningSquare: {
                        row: 2,
                        column: 0,
                    },
                },
                {
                    type: WinType.COLUMN,
                    firstWinningSquare: {
                        row: 0,
                        column: 0,
                    },
                },
                {
                    type: WinType.DIAGONAL_TOP_LEFT,
                    firstWinningSquare: {
                        row: 0,
                        column: 0,
                    },
                },
                {
                    type: WinType.DIAGONAL_TOP_RIGHT,
                    firstWinningSquare: {
                        row: 0,
                        column: 2,
                    },
                }]),
            });
        });

        it('detects a draw', function (): void {
            const initialState = {
                ...reducer(),
                currentPlayer: PLAYER_O as typeof PLAYER_O,
                squares: [
                    [PLAYER_O, PLAYER_X,  PLAYER_O],
                    [PLAYER_X, PLAYER_X,  PLAYER_O],
                    [PLAYER_O, undefined, PLAYER_X],
                ] as const,
            };
            expect(reducer(initialState, {
                type: CLAIM_SQUARE,
                payload: {
                    player: PLAYER_O,
                    row: 2,
                    column: 1,
                },
            })).toEqual({
                ...initialState,
                currentPlayer: PLAYER_X,
                squares: [
                    [PLAYER_O, PLAYER_X, PLAYER_O],
                    [PLAYER_X, PLAYER_X, PLAYER_O],
                    [PLAYER_O, PLAYER_O, PLAYER_X],
                ],
                status: GameStatus.DRAW,
                wins: [],
            });
        });
    });
});