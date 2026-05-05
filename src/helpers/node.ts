import { DebounceMutationCallbackOptions } from '@/types/mutation-observer';

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
    return BuiltinX.debounce(callback, {
      debug: opts.debug,
      debounceMs: opts.debounceMs,
      immediate: opts.immediate,
      shouldSkip: m => {
        const filtered = m.filter(m => !opts.exclusions.some(x => x(m)));
        m.replaceFrom(filtered); // Update the original array with the filtered records
        return filtered.length === 0;
      },
    });
  }
}