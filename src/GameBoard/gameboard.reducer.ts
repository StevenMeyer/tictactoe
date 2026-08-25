import { Player, PLAYER_O, PLAYER_X } from './player';

type Square = Player | undefined;
type Row = ReadonlyArray<Square>;
type Grid = ReadonlyArray<Row>;

export interface State {
    readonly squares: Grid;
}

type Action<T extends string, P = undefined> = {
    type: T;
} & (P extends undefined ? { payload?: unknown } : { payload: P });

/** Is the candidate *any* action? */
function isAction(candidate: unknown): candidate is Action<string>;
/**
 * Is the candidate an action of the given string `type`?
 *
 * The payload is not defined if you use this type guard. To define a payload, use the `payloadGuard` parameter.
 */
function isAction<T extends string>(candidate: unknown, type: T): candidate is Action<T>;
/**
 * Is the candidate an action of the given `type` and `payload`?
 */
function isAction<T extends string, A extends Action<T>>(candidate: unknown, type: T, payloadGuard: (c: Action<T>) => c is A): candidate is A;
function isAction(candidate: unknown, type?: string, payloadGuard?: (c: Action<string>) => boolean): candidate is Action<string> {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
        return false;
    }
    if (!('type' in candidate) || !candidate.type || typeof candidate.type !== 'string') {
        return false;
    }
    if (type === undefined) {
        return true;
    }
    if (type !== candidate.type) {
        return false;
    }
    if (!payloadGuard || typeof payloadGuard.call !== 'function') {
        return true;
    }
    return payloadGuard(candidate as Action<string>);
}

export const CLAIM_SQUARE = 'CLAIM SQUARE';
type ClaimSquareAction = Action<typeof CLAIM_SQUARE, {
    column: number,
    row: number,
    player: Player,
}>;
function isClaimSquareAction(candidate: unknown): candidate is ClaimSquareAction {
    return isAction(candidate, CLAIM_SQUARE, (action): action is ClaimSquareAction => {
        return typeof action.payload === 'object'
            && !!action.payload
            && !Array.isArray(action.payload)
            && typeof (action.payload as Record<'row', number>).row === 'number'
            && typeof (action.payload as Record<'column', number>).column === 'number'
            && 'player' in action.payload;
    });
}
function doClaimSquareAction(state: State, action: ClaimSquareAction): State {
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

    return {
        ...state,
        squares: state.squares.map((row, rowIndex) => {
            if (rowIndex === claimRow) {
                return row.map((square, columnIndex): Square => {
                    if (columnIndex === claimColumn && square === undefined) {
                        return claimPlayer;
                    }
                    return square;
                });
            }
            return row;
        }),
    };
}

export function reducer(state?: State, action?: Action<string>): State {
    if (!state) {
        return reducer({
            squares: [
                [undefined, undefined, undefined],
                [undefined, undefined, undefined],
                [undefined, undefined, undefined],
            ],
        }, action);
    }
    if (!action || !isAction(action)) {
        return state;
    }
    if (isClaimSquareAction(action)) {
        return doClaimSquareAction(state, action);
    }
    return state;
}
