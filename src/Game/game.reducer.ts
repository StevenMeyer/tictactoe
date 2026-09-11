import { State as BoardState, reducer as boardReducer } from '../GameBoard/gameboard.reducer';
import { ClaimSquareAction, isClaimSquareAction } from '../Game/claimSquareAction';
import { detectStatus, GameWin } from '../GameBoard/status';
import { Action, isAction } from '../util/action';
import { Player, PLAYER_O, PLAYER_X } from '../GameBoard/player';
import { CREATE_GAME, CreateGameAction, isCreateGameAction } from './createGameAction';
import { CREATE_BOARD } from '../GameBoard/createBoardAction';

export interface State extends BoardState {
    readonly currentPlayer: Player;
    readonly wins: ReadonlyArray<GameWin>;
}

function doCreateGameAction(state: undefined, action: CreateGameAction): State;
function doCreateGameAction<S extends State>(state: S, action: CreateGameAction): S;
function doCreateGameAction(state: State | undefined, _: CreateGameAction): State {
    return {
        ...boardReducer(state, {
            type: CREATE_BOARD,
        }),
        currentPlayer: PLAYER_X,
        wins: [],
    };
}

function doClaimSquareAction(state: State, action: ClaimSquareAction): State {
    const boardResult = boardReducer(state, {
        ...action,
        payload: {
            ...action.payload,
            player: state.currentPlayer,
        },
    });

    const isSquareClaimed = state.squares[action.payload.row][action.payload.column] !== boardResult.squares[action.payload.row][action.payload.column];
    const currentPlayer = isSquareClaimed
        ? (state.currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X)
        : state.currentPlayer;
    
    const { status, wins } = detectStatus(boardResult.squares);
    return {
        ...boardResult,
        currentPlayer,
        status,
        wins: wins ?? [],
    };
}

/**
 * This reducer allows play of the basic game of tic-tac-toe.
 */
export function reducer(): State;
export function reducer<S extends State>(state?: S, action?: Action<string>): S;
export function reducer(state?: State, action?: Action<string>): State {
    if (!state) {
        return doCreateGameAction(undefined, isCreateGameAction(action) ? action : {
            type: CREATE_GAME,
        });
    }
    if (!action || !isAction(action)) {
        return state;
    }
    if (isCreateGameAction(action)) {
        return doCreateGameAction(state, action);
    }
    if (isClaimSquareAction(action)) {
        return doClaimSquareAction(state, action);
    }
    return state;
}
