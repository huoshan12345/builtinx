import type { Nullable } from '@/types/lib';
import { DebounceOptions, type DebounceCallback } from '@/types/debounce-options';

type Timer = ReturnType<typeof setTimeout>;

type DebounceState<TArgs extends any[]> =
  | { phase: 'idle' }
  | WaitingState<TArgs>;

interface WaitingState<TArgs extends any[]> {
  phase: 'waiting';
  debounceTimer: Nullable<Timer>;
  maxWaitTimer: Nullable<Timer>;
  pendingArgs?: TArgs;
}

/**
 * Creates a debounced function that controls whether the callback runs at the leading edge,
 * trailing edge, or both edges of a debounce window.
 *
 * Both `leading` and `trailing` default to true. When both are enabled, a single call runs
 * only on the leading edge; a trailing call runs only when a later call occurs in the window.
 * When `maxWaitMs` is set, a pending call is invoked with the latest arguments once that
 * maximum wait is reached, even if frequent calls keep resetting the debounce delay or
 * both edges are disabled. Values shorter than `debounceMs` are treated as `debounceMs`.
 * With `trailing` disabled, stopping activity before the maximum wait is reached does not
 * invoke the final pending call.
 * @param callback The function to debounce.
 * @param options An object containing debounce options.
 * @returns A new debounced function.
 */
export function debounce<TArgs extends any[]>(callback: DebounceCallback<TArgs>, options: Partial<DebounceOptions<TArgs>>): DebounceCallback<TArgs> {
  const opts = new DebounceOptions(options);
  const maxWaitMs = opts.maxWaitMs == null
    ? undefined
    : Math.max(opts.maxWaitMs, opts.debounceMs);
  let state: DebounceState<TArgs> = { phase: 'idle' };

  const invoke = (args: TArgs) => {
    opts.beforeCallback?.(...args);
    callback(...args);
    opts.afterCallback?.(...args);
  };

  const invokePending = (waiting: WaitingState<TArgs>) => {
    const args = waiting.pendingArgs;
    waiting.pendingArgs = undefined;

    if (args !== undefined) {
      invoke(args);
    }
  };

  const cancelMaxWait = (waiting: WaitingState<TArgs>) => {
    if (waiting.maxWaitTimer != null) {
      clearTimeout(waiting.maxWaitTimer);
      waiting.maxWaitTimer = null;
    }
  };

  const finishWaiting = (waiting: WaitingState<TArgs>) => {
    if (state !== waiting) {
      return;
    }

    cancelMaxWait(waiting);
    state = { phase: 'idle' };

    if (opts.trailing) {
      invokePending(waiting);
    } else {
      waiting.pendingArgs = undefined;
    }
  };

  const scheduleMaxWait = (waiting: WaitingState<TArgs>) => {
    if (maxWaitMs == null || waiting.maxWaitTimer != null) {
      return;
    }

    waiting.maxWaitTimer = setTimeout(() => {
      if (state !== waiting) {
        return;
      }

      waiting.maxWaitTimer = null;
      // A maximum-wait invocation consumes pending work without ending the activity window.
      invokePending(waiting);
    }, maxWaitMs);
  };

  const queuePending = (waiting: WaitingState<TArgs>, args: TArgs) => {
    waiting.pendingArgs = args;
    scheduleMaxWait(waiting);
  };

  const restartDebounceTimer = (waiting: WaitingState<TArgs>) => {
    if (waiting.debounceTimer != null) {
      clearTimeout(waiting.debounceTimer);
    }

    waiting.debounceTimer = setTimeout(
      () => finishWaiting(waiting),
      opts.debounceMs,
    );
  };

  const startWaiting = (args: TArgs) => {
    const waiting: WaitingState<TArgs> = {
      phase: 'waiting',
      debounceTimer: null,
      maxWaitTimer: null,
    };
    state = waiting;

    if (!opts.leading && (opts.trailing || maxWaitMs != null)) {
      queuePending(waiting, args);
    }

    // Fully establish the waiting state before invoking user code so synchronous reentry
    // observes an active window and exceptions cannot leave a timerless waiting state.
    restartDebounceTimer(waiting);

    if (opts.leading) {
      invoke(args);
    }
  };

  const continueWaiting = (waiting: WaitingState<TArgs>, args: TArgs) => {
    if (opts.trailing || maxWaitMs != null) {
      queuePending(waiting, args);
    }

    restartDebounceTimer(waiting);
  };

  return (...args: TArgs) => {
    if (opts.shouldSkip?.(...args) === true) {
      opts.onSkipped?.(...args);
      return;
    }

    if (!opts.leading && !opts.trailing && maxWaitMs == null) {
      return;
    }

    if (state.phase === 'idle') {
      startWaiting(args);
    } else {
      continueWaiting(state, args);
    }
  };
}

/**
 * Defines a property on the target object if it does not already exist.
 * @param target The object on which to define the property.
 * @param key The name of the property to be defined.
 * @param value The value of the property to be defined.
 * @param writable Indicates if the property should be writable. Default is true.
 * @param configurable Indicates if the property should be configurable. Default is true.
 * @param enumerable Indicates if the property should be enumerable. Default is false.
 * @returns True if the property was defined, false if it already exists or if the target or key is null/undefined.
 */
export function definePropertyIfAbsent<
  T extends object,
  K extends PropertyKey
>(
  target: T,
  key: K,
  value: unknown,
  writable = true,
  configurable = true,
  enumerable = false
): boolean {
  if (target == null
    || key == null
    || Object.prototype.hasOwnProperty.call(target, key)) {
    return false;
  }

  Object.defineProperty(target, key, {
    value,
    writable,
    configurable,
    enumerable
  });

  return true;
}

/**
 * Shallow merges two optional objects.
 *
 * - If `next` is null/undefined, returns `current` as-is.
 * - If `current` is null/undefined, returns `next` as-is.
 * - Otherwise, returns a new object with `next`'s properties
 *   overwriting `current`'s at the top level only (nested objects
 *   are replaced wholesale, not merged recursively).
 *
 * Note: an explicit `undefined` value on `next` WILL overwrite the
 * corresponding field in `current` (unlike lodash's `_.merge`).
 *
 * @param current - The base object.
 * @param next - The object whose properties take precedence.
 * @returns A new merged object, or `undefined` if both inputs are null/undefined.
 */
export function shallowMerge<T extends object>(
  current?: T,
  next?: T,
): T | undefined {
  if (next == null) {
    return current;
  }

  if (current == null) {
    return next;
  }

  return {
    ...current,
    ...next,
  };
}
