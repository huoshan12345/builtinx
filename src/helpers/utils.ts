import type { Nullable } from '@/types/lib';
import { DebounceOptions, type DebounceCallback } from '@/types/utils';

/**
 * Creates a debounced function that controls whether the callback runs at the leading edge,
 * trailing edge, or both edges of a debounce window.
 *
 * Both `leading` and `trailing` default to true. When both are enabled, a single call runs
 * only on the leading edge; a trailing call runs only when a later call occurs in the window.
 * @param callback The function to debounce.
 * @param options An object containing debounce options.
 * @returns A new debounced function.
 */
export function debounce<TArgs extends any[]>(callback: DebounceCallback<TArgs>, options: Partial<DebounceOptions<TArgs>>): DebounceCallback<TArgs> {
  const opts = new DebounceOptions(options);
  let timer: Nullable<ReturnType<typeof setTimeout>> = null;
  let trailingArgs: TArgs | undefined;
  let hasTrailingCall = false;
  const cb = (...args: TArgs) => {
    opts.beforeCallback?.(...args);
    callback(...args);
    opts.afterCallback?.(...args);
  };

  return function (...args: TArgs) {    
    if (opts.shouldSkip?.(...args) === true) {
      opts.onSkipped?.(...args);
      return;
    }

    const isFirstCallInWindow = timer == null;
    if (timer != null) {
      clearTimeout(timer);
    }

    if (isFirstCallInWindow && opts.leading) {
      cb(...args);
    }

    if (opts.trailing && (!isFirstCallInWindow || !opts.leading)) {
      trailingArgs = args;
      hasTrailingCall = true;
    }

    if (!opts.leading && !opts.trailing) {
      return;
    }

    timer = setTimeout(() => {
      timer = null;
      if (hasTrailingCall) {
        const args = trailingArgs!;
        trailingArgs = undefined;
        hasTrailingCall = false;
        cb(...args);
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
