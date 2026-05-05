import { DebounceMutationCallbackOptions, type NodeMutationCallback } from '@/types/mutation-observer';

export interface Node {
  /**
   * Creates a debounced version of a MutationCallback.
   * @param callback The original MutationCallback to debounce.
   * @param options Configuration options for debouncing the callback.
   * @returns A debounced MutationCallback that can be used with a MutationObserver.
   */
  debounceMutationCallback(callback: MutationCallback, options: Partial<DebounceMutationCallbackOptions>): MutationCallback;
}

export const Node: Node = {
  debounceMutationCallback(callback: MutationCallback, options: Partial<DebounceMutationCallbackOptions>): MutationCallback {
    const opts = new DebounceMutationCallbackOptions(options);
    return BuiltinX.debounce((records, observer) => {
      const filtered = records.filter(m => !opts.exclusions.some(x => x(m)));
      callback(filtered, observer);
    }, {
      beforeCallback: opts.beforeCallback,
      afterCallback: opts.afterCallback,
      onSkipped: opts.onSkipped,
      debounceMs: opts.debounceMs,
      immediate: opts.immediate,
      shouldSkip: records => records.count(m => !opts.exclusions.some(x => x(m))) === 0,
    });
  }
}