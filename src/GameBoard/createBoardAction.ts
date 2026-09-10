import { Action, isAction } from '../util/action';

export const CREATE_BOARD = 'CREATE BOARD';

export type CreateBoardAction = Action<typeof CREATE_BOARD>;

export function isCreateBoardAction(candidate: unknown): candidate is CreateBoardAction {
    return isAction(candidate, CREATE_BOARD);
}
