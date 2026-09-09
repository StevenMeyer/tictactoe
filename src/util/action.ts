export type Action<T extends string, P = undefined> = {
    type: T;
} & (P extends undefined ? { payload?: unknown; } : { payload: P; });

/** Is the candidate *any* action? */
export function isAction(candidate: unknown): candidate is Action<string>;
/**
 * Is the candidate an action of the given string `type`?
 *
 * The payload is not defined if you use this type guard. To define a payload, use the `payloadGuard` parameter.
 */
export function isAction<T extends string>(candidate: unknown, type: T): candidate is Action<T>;
/**
 * Is the candidate an action of the given `type` and `payload`?
 */
export function isAction<T extends string, A extends Action<T>>(candidate: unknown, type: T, payloadGuard: (c: Action<T>) => c is A): candidate is A;
export function isAction(candidate: unknown, type?: string, payloadGuard?: (c: Action<string>) => boolean): candidate is Action<string> {
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

/**
 * Does the candidate Action have an object payload?
 *
 * This is intended to be used in a payload guard for `isAction()` to ensure the payload is an object and remove some boilerplate.
 **/
export function hasObjectPayload(candidate: Action<string>): candidate is Action<string, Record<string, unknown>> {
    return typeof candidate.payload === 'object'
        && !!candidate.payload
        && !Array.isArray(candidate.payload);
}

