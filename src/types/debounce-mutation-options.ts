import type { Predicate } from './lib.js';

/**
 * Options for creating a debounced mutation callback with exclusion filtering.
 */
export class DebounceMutationOptions {
  /** Debounce interval in milliseconds; default is 1000ms. */
  debounceMs: number = 1000;
  /**
   * Maximum time a pending callback may be delayed during continuous mutations.
   * This limit applies independently of `leading` and `trailing`. Values shorter than
   * `debounceMs` are treated as `debounceMs`. Omit it to disable the maximum wait.
   */
  maxWaitMs?: number;
  /** If true, invokes the first callback in a debounce window immediately; default is true. */
  leading: boolean = true;
  /**
   * If true, invokes the final pending callback after mutations stop; default is true.
   * Setting this to false does not disable invocations caused by `maxWaitMs`.
   */
  trailing: boolean = true;
  /** List of predicates to determine which mutations should be excluded (ignored). */
  exclusions: Predicate<MutationRecord>[] = [];

  /** Optional callback to be executed before the main callback. */
  beforeCallback?: MutationCallback;
  /** Optional callback to be executed after the main callback. */
  afterCallback?: MutationCallback;
  /** Optional function that will be called when the callback is skipped. */
  onSkipped?: MutationCallback;

  /** Creates resolved options from partial overrides. */
  constructor(init: Partial<DebounceMutationOptions>) {
    Object.assign(this, init);
  }
}
