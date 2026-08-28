import { DebounceMutationCallbackOptions } from '@/types/mutation-observer';
import { debounce } from './utils';

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
    return debounce(callback, {
      beforeCallback: opts.beforeCallback,
      afterCallback: opts.afterCallback,
      onSkipped: opts.onSkipped,
      debounceMs: opts.debounceMs,
      maxWaitMs: opts.maxWaitMs,
      leading: opts.leading,
      trailing: opts.trailing,
      shouldSkip: records => {
        const filtered = records.filter(m => !opts.exclusions.some(x => x(m)));
        records.replaceFrom(filtered); // Update the original array with the filtered records
        return filtered.length === 0;
      },
    });
  }
}
