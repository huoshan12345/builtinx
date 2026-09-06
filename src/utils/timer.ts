import { TimeSpan } from './time-span.js';

const MAX_TIMEOUT_MS = 2_147_483_647;

function waitForInterval(milliseconds: number, signal?: AbortSignal): Promise<boolean> {
  if (signal?.aborted) {
    return Promise.resolve(false);
  }

  if (!signal) {
    return new Promise(resolve => setTimeout(() => resolve(true), milliseconds));
  }

  return new Promise(resolve => {
    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      resolve(false);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve(true);
    }, milliseconds);

    signal.addEventListener('abort', onAbort, { once: true });
    if (signal.aborted) {
      onAbort();
    }
  });
}

export namespace Timer {
  /**
   * Yields at a fixed interval until the returned async generator is closed or the signal aborts.
   *
   * The interval must be finite, non-negative, and no greater than the platform's maximum
   * single timer delay. Aborting the signal completes the generator without yielding again.
   */
  export async function* every(timeSpan: TimeSpan | number, signal?: AbortSignal) {
    const ms = typeof timeSpan === 'number'
      ? timeSpan
      : timeSpan.totalMilliseconds;

    if (!Number.isFinite(ms) || ms < 0 || ms > MAX_TIMEOUT_MS) {
      throw new RangeError(`Interval must be a finite number between 0 and ${MAX_TIMEOUT_MS} milliseconds.`);
    }

    while (true) {
      if (!await waitForInterval(ms, signal)) {
        return;
      }
      yield;
    }
  }
}
