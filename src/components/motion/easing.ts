/**
 * Shared easing curves as const tuples so motion's strict types accept them.
 * Using `as const` makes TS infer a 4-tuple `[number, number, number, number]`
 * (motion's expected cubic-bezier shape) instead of `number[]`.
 */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;
