import { State as BoardState, reducer as boardReducer } from '../GameBoard/gameboard.reducer';
import { isClaimSquareAction } from '../GameBoard/claimSquareAction';
import { detectStatus, GameStatus, GameWin } from '../GameBoard/status';
import { Action, isAction } from '../util/action';
import { ClaimSquareAction } from './claimSquareAction';

export interface State extends BoardState {
    readonly wins: ReadonlyArray<GameWin>;
}

function doClaimSquareAction(state: State, action: ClaimSquareAction): State {
    const boardResult = boardReducer(state, action);
    const { status, wins } = detectStatus(boardResult.squares);
    return {
        ...boardResult,
        status,
        wins: wins ?? [],
    };
}

/**
 * This reducer allows play of the basic game of tic-tac-toe.
 */
export function reducer(state?: State, action?: Action<string>): State {
    if (!state) {
        return reducer({
            ...boardReducer(),
            wins: [],
        }, action);
    }
    if (!action || !isAction(action)) {
        return state;
    }
    if (isClaimSquareAction(action)) {
        return doClaimSquareAction(state, action);
    }
}
