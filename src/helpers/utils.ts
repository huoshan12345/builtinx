import type { Nullable } from '@/types/lib';
import { DebounceOptions, type DebounceCallback } from '@/types/utils';

/**
 * Creates a debounced function that controls whether the callback runs at the leading edge,
 * trailing edge, or both edges of a debounce window.
 *
 * Both `leading` and `trailing` default to true. When both are enabled, a single call runs
 * only on the leading edge; a trailing call runs only when a later call occurs in the window.
 * When `maxWaitMs` is set, a pending call is invoked with the latest arguments once that
 * maximum wait is reached, even if frequent calls keep resetting the debounce delay or
 * `trailing` is false. With `trailing` disabled, stopping activity does not invoke the final
 * pending call.
 * @param callback The function to debounce.
 * @param options An object containing debounce options.
 * @returns A new debounced function.
 */
export function debounce<TArgs extends any[]>(callback: DebounceCallback<TArgs>, options: Partial<DebounceOptions<TArgs>>): DebounceCallback<TArgs> {
  const opts = new DebounceOptions(options);
  let timer: Nullable<ReturnType<typeof setTimeout>> = null;
  let maxWaitTimer: Nullable<ReturnType<typeof setTimeout>> = null;
  let pendingArgs: TArgs | undefined;
  const cb = (...args: TArgs) => {
    opts.beforeCallback?.(...args);
    callback(...args);
    opts.afterCallback?.(...args);
  };

  const invokePending = () => {
    if (pendingArgs === undefined) {
      return;
    }

    const args = pendingArgs;
    pendingArgs = undefined;
    cb(...args);
  };

  const clearMaxWaitTimer = () => {
    if (maxWaitTimer != null) {
      clearTimeout(maxWaitTimer);
      maxWaitTimer = null;
    }
  };

  const scheduleMaxWait = () => {
    if (opts.maxWaitMs == null || maxWaitTimer != null || pendingArgs === undefined) {
      return;
    }

    maxWaitTimer = setTimeout(() => {
      maxWaitTimer = null;
      invokePending();
    }, opts.maxWaitMs);
  };

  return function (...args: TArgs) {
    if (opts.shouldSkip?.(...args) === true) {
      opts.onSkipped?.(...args);
      return;
    }

    if (!opts.leading && !opts.trailing) {
      return;
    }

    const isFirstCallInWindow = timer == null;
    if (timer != null) {
      clearTimeout(timer);
    }

    if (isFirstCallInWindow && opts.leading) {
      cb(...args);
    }

    if (!isFirstCallInWindow || !opts.leading) {
      if (opts.trailing || opts.maxWaitMs != null) {
        pendingArgs = args;
        scheduleMaxWait();
      }
    }

    timer = setTimeout(() => {
      timer = null;
      clearMaxWaitTimer();
      if (opts.trailing) {
        invokePending();
      } else {
        pendingArgs = undefined;
      }
    }, opts.debounceMs);
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
