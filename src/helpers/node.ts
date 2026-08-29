import { debounce } from './utils';
import { DebounceMutationOptions } from '@/types/debounce-mutation-options';

export interface Node {
  /**
   * Creates a debounced version of a MutationCallback.
   * @param callback The original MutationCallback to debounce.
   * @param options Configuration options for debouncing the callback.
   * @returns A debounced MutationCallback that can be used with a MutationObserver.
   */
  debounceMutationCallback(callback: MutationCallback, options: Partial<DebounceMutationOptions>): MutationCallback;
}

export const Node: Node = {
  debounceMutationCallback(callback: MutationCallback, options: Partial<DebounceMutationOptions>): MutationCallback {
    const opts = new DebounceMutationOptions(options);
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
