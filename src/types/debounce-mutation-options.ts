import type { Predicate } from './lib';

/**
 * Options for the enhanced MutationObserver, extending the standard MutationObserverInit.
 * Includes additional properties for debouncing and mutation exclusion logic.
 */
export class DebounceMutationOptions {
  /** Debounce interval in milliseconds. */
  debounceMs: number = 1000;
  /** An optional number specifying the maximum time a pending call may be delayed. */
  maxWaitMs?: number;
  /** If true, triggers the callback on the leading edge of the debounce. */
  leading: boolean = true;
  /** If true, triggers the callback on the trailing edge of the debounce. */
  trailing: boolean = true;
  /** List of predicates to determine which mutations should be excluded (ignored). */
  exclusions: Predicate<MutationRecord>[] = [];

  /** Optional callback to be executed before the main callback. */
  beforeCallback?: MutationCallback;
  /** Optional callback to be executed after the main callback. */
  afterCallback?: MutationCallback;
  /** Optional function that will be called when the callback is skipped. */
  onSkipped?: MutationCallback;

  constructor(options: Partial<DebounceMutationOptions>) {
    Object.assign(this, options);
  }
}
