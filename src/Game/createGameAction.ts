import { Action, isAction } from '../util/action';

export const CREATE_GAME = 'CREATE GAME';

export type CreateGameAction = Action<typeof CREATE_GAME>;

export function isCreateGameAction(candidate: unknown): candidate is CreateGameAction {
    return isAction(candidate, CREATE_GAME);
}
