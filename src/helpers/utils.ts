import type { Nullable } from '@/types/lib';
import { DebounceOptions, type DebounceCallback } from '@/types/utils';

/**
 * Creates a debounced function that delays invoking the provided callback until after a specified wait time has elapsed since the last time the debounced function was invoked.   
 * Optionally, the callback can be invoked immediately on the leading edge of the timeout instead of the trailing edge.
 * @param callback The function to debounce.
 * @param options An object containing debounce options.
 * @returns A new debounced function.
 */
export function debounce<TArgs extends any[]>(callback: DebounceCallback<TArgs>, options: Partial<DebounceOptions<TArgs>>): DebounceCallback<TArgs> {
  const opts = new DebounceOptions(options);
  let timer: Nullable<ReturnType<typeof setTimeout>> = null;

  const cb = (...args: TArgs) => {
    if (opts.debug) {
      console.debug('Debounce callback executed.', ...args);
    }
    callback(...args);
  };

  return function (...args: TArgs) {
    if (opts.shouldSkip?.(...args) === true) {
      if (opts.debug) {
        console.debug('Debounce skipped.', ...args);
      }
      return;
    }

    if (timer != null) {
      clearTimeout(timer);
    }

    if (opts.immediate) {
      if (timer) {
        timer = setTimeout(() => {
          cb(...args);
          timer = null;
        }, opts.debounceMs);
      } else {
        timer = setTimeout(() => timer = null, opts.debounceMs);
        cb(...args);
      }
    } else {
      timer = setTimeout(() => {
        cb(...args);
        timer = null;
      }, opts.debounceMs);
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