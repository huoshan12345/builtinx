import type { Nullable, Predicate } from '@/types/lib';

/**
 * Creates a debounced function that delays invoking the provided callback until after a specified wait time has elapsed since the last time the debounced function was invoked.   
 * Optionally, the callback can be invoked immediately on the leading edge of the timeout instead of the trailing edge.
 * @param callback The function to debounce.
 * @param delayMs The number of milliseconds to delay.
 * @param immediate If true, the callback will be invoked immediately on the leading edge of the timeout. Default is false.
 * @param skip An optional predicate function that, when provided, will be called with the arguments of the debounced function. If it returns true, the callback will not be invoked and the timer will not be reset.
 * @returns A new debounced function.
 */
export function debounce(callback: (args: IArguments) => void, delayMs: number, immediate: boolean, skip?: Predicate<IArguments>) {
  let timer: Nullable<NodeJS.Timeout> = null;
  const cb = (args: IArguments) => {
    callback(args);
  };

  return function () {
    let args = arguments;

    if (skip?.(args) === true) {
      return;
    }

    if (timer != null) {
      clearTimeout(timer);
    }
    if (immediate) {
      if (timer) {
        timer = setTimeout(() => {
          cb(args);
          timer = null;
        }, delayMs);
      } else {
        timer = setTimeout(() => timer = null, delayMs);
        cb(args);
      }
    } else {
      timer = setTimeout(() => {
        cb(args);
        timer = null;
      }, delayMs);
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