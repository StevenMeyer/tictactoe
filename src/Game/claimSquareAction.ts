import { ClaimSquareAction as BoardClaimSquareAction, CLAIM_SQUARE } from '../GameBoard/claimSquareAction';
import { hasObjectPayload, isAction } from '../util/action';

export type ClaimSquareAction = Exclude<BoardClaimSquareAction, 'player'>;

export function isClaimSquareAction(candidate: unknown): candidate is ClaimSquareAction {
    return isAction(candidate, CLAIM_SQUARE, (action): action is ClaimSquareAction => {
        return hasObjectPayload(action)
            && typeof action.payload.row === 'number'
            && typeof action.payload.column === 'number';
    });
}
