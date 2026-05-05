import type { Predicate } from '@/types/lib';

export interface Node {
  /**
   * @description Creates a debounced version of a MutationCallback function.
   * @param callback The original MutationCallback function to debounce.
   * @param delayMs The number of milliseconds to delay the callback execution.
   * @param immediate If true, the callback will be executed immediately on the first call, and then debounced for subsequent calls.
   * @param excludes An array of Predicate functions that determine which MutationRecords should be excluded from triggering the callback.
   * @returns A new MutationCallback function that is debounced according to the specified parameters.
   */
  debounceMutationCallback(callback: MutationCallback, delayMs: number, immediate: boolean, excludes: Predicate<MutationRecord>[]): MutationCallback;
}

export const Node: Node = {
  debounceMutationCallback(callback: MutationCallback, delayMs: number, immediate: boolean, excludes: Predicate<MutationRecord>[]): MutationCallback {
    return BuiltinX.debounce(m => callback(m[0], m[1]), delayMs, immediate, args => {
      const all = args[0] as MutationRecord[];
      const records = all.filter(m => !excludes.some(x => x(m)));
      args[0] = records;
      return records.length === 0;
    });
  }
}