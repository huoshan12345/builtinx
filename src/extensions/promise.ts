import { definePropertyIfAbsent } from '@/helpers/utils';
import type { AwaitableAction, Predicate } from '@/types/lib';

declare global {
  interface PromiseConstructor {
    /**
     * Creates a promise that resolves after a specified delay.
     * @param ms The delay in milliseconds.
     */
    delay(ms: number): Promise<void>;

    /**
     * Retries a promise-returning function a specified number of times with an optional delay between attempts.
     * @param factory A function that returns a promise.
     * @param times The number of retry attempts.
     * @param delayMs The delay in milliseconds between retry attempts (optional).
     */
    retry<T>(factory: () => Promise<T>, times: number, delayMs?: number): Promise<T>;
  }
  interface Promise<T> {
    /**
     * Delays the resolution of the promise by a specified time.
     * @param ms The delay in milliseconds.
     */
    delay(ms: number): Promise<T>;

    /**
     * Ignores any errors that occur in the promise chain.
     * @param onError A callback function to handle the error.
     */
    ignore(onError?: (e: unknown) => void): Promise<void | T>;

    /**
     * Invokes an action with the resolved value, then resolves with that same value.
     *
     * The action may complete synchronously or asynchronously.
     */
    tap(action: AwaitableAction<T>): Promise<T>;

    /**
     * Invokes an action with the resolved value only when the condition is met,
     * then resolves with that same value.
     *
     * The action may complete synchronously or asynchronously.
     */
    tapIf(condition: Predicate<T>, action: AwaitableAction<T>): Promise<T>;
  }
}

function delayStatic(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function delay<T>(this: Promise<T>, ms: number): Promise<T> {
  const r = await this;
  if (ms > 0) {
    await Promise.delay(ms);
  }
  return r;
}

async function ignore<T>(this: Promise<T>, onError?: (e: unknown) => void): Promise<void | T> {
  try {
    return await this;
  } catch (e) {
    return onError?.(e);
  }
}

function tap<T>(this: Promise<T>, action: AwaitableAction<T>): Promise<T> {
  return this.then(async value => {
    await action(value);
    return value;
  });
}

function tapIf<T>(this: Promise<T>, condition: Predicate<T>, action: AwaitableAction<T>): Promise<T> {
  return this.then(async value => {
    if (condition(value)) {
      await action(value);
    }
    return value;
  });
}

async function retry<T>(factory: () => Promise<T>, times: number, delayMs = 0): Promise<T> {
  try {
    return await factory();
  } catch (e) {
    if (times <= 0) {
      throw e;
    }

    if (delayMs > 0) {
      await Promise.delay(delayMs);
    }
    return await retry(factory, times - 1, delayMs);
  }
}

definePropertyIfAbsent(Promise, 'delay', delayStatic);
definePropertyIfAbsent(Promise, 'retry', retry);
definePropertyIfAbsent(Promise.prototype, 'delay', delay);
definePropertyIfAbsent(Promise.prototype, 'ignore', ignore);
definePropertyIfAbsent(Promise.prototype, 'tap', tap);
definePropertyIfAbsent(Promise.prototype, 'tapIf', tapIf);

