import { Action, isAction } from '../util/action';
import { CLAIM_SQUARE, ClaimSquareAction, isClaimSquareAction } from './claimSquareAction';
import { CREATE_BOARD, CreateBoardAction, isCreateBoardAction } from './createBoardAction';
import { Player, PLAYER_O, PLAYER_X } from './player';
import { GameStatus } from './status';

type Square = Player | undefined;
type Row = ReadonlyArray<Square>;
type Grid = ReadonlyArray<Row>;

export interface State {
    readonly squares: Grid;
    readonly status: GameStatus;
}

function doCreateBoardAction(state: undefined, action: CreateBoardAction): State;
function doCreateBoardAction<S extends State>(state: S, action: CreateBoardAction): S;
function doCreateBoardAction(state: State | undefined, _: CreateBoardAction): State {
    return {
        ...state,
        squares: [
            [undefined, undefined, undefined],
            [undefined, undefined, undefined],
            [undefined, undefined, undefined],
        ],
        status: GameStatus.IN_PROGRESS,
    };
}

function doClaimSquareAction<S extends State>(state: S, action: ClaimSquareAction): S {
    const { row: claimRow, column: claimColumn, player: claimPlayer } = action.payload;
    if (claimRow < 0 || claimRow > 2) {
        throw new Error(`${CLAIM_SQUARE}: row out of bounds`, { cause: claimRow });
    }
    if (claimColumn < 0 || claimColumn > 2) {
        throw new Error(`${CLAIM_SQUARE}: column out of bounds`, { cause: claimColumn });
    }
    if (claimPlayer !== PLAYER_O && claimPlayer !== PLAYER_X) {
        throw new Error(`${CLAIM_SQUARE}: invalid player`, { cause: claimPlayer });
    }

    if (state.squares[claimRow][claimColumn] !== undefined) {
        return state;
    }

    const squares = state.squares.map((row, rowIndex) => {
        if (rowIndex === claimRow) {
            return row.map((square, columnIndex): Square => {
                if (columnIndex === claimColumn) {
                    return claimPlayer;
                }
                return square;
            });
        }
        return row;
    });

    return {
        ...state,
        squares,
    };
}

/**
 * This reducer represents the basic game board only.
 * 
 * It is just the piece of paper with a grid and noughts and crosses; it doesn't
 * know whose turn it is or whether any player has won. Such concepts belong to the
 * referee, who knows the rules and the state of play.
 */
export function reducer(): State;
export function reducer<S extends State>(state?: S, action?: Action<string>): S;
export function reducer(state?: State, action?: Action<string>): State {
    if (!state) {
        return doCreateBoardAction(undefined, isCreateBoardAction(action) ? action : {
            type: CREATE_BOARD,
        });
    }
    if (!action || !isAction(action)) {
        return state;
    }
    if (isCreateBoardAction(action)) {
        return doCreateBoardAction(state, action);
    }
    if (isClaimSquareAction(action)) {
        return doClaimSquareAction(state, action);
    }
    return state;
}
