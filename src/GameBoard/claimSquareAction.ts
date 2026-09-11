import { Action, hasObjectPayload, isAction } from '../util/action';
import { Player } from './player';

export const CLAIM_SQUARE = 'CLAIM SQUARE';

export type ClaimSquareAction = Action<typeof CLAIM_SQUARE, {
    readonly column: number;
    readonly row: number;
    readonly player: Player;
}>;

export function isClaimSquareAction(candidate: unknown): candidate is ClaimSquareAction {
    return isAction(candidate, CLAIM_SQUARE, (action): action is ClaimSquareAction => {
        return hasObjectPayload(action)
            && typeof action.payload.row === 'number'
            && typeof action.payload.column === 'number'
            && 'player' in action.payload;
    });
}

