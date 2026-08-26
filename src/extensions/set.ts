import { definePropertyIfAbsent } from '@/helpers/utils';

declare global {
  interface Set<T> {
    /**
     * Returns whether any value in the set satisfies the predicate.
     *
     * The predicate receives each value in insertion order and iteration stops after the first match.
     */
    some(predicate: (value: T, index: number, set: ReadonlySet<T>) => boolean): boolean;
  }
}

function some<T>(this: Set<T>, predicate: (value: T, index: number, set: ReadonlySet<T>) => boolean): boolean {
  let index = 0;
  for (const value of this) {
    if (predicate(value, index, this)) {
      return true;
    }
    index++;
  }
  return false;
}

definePropertyIfAbsent(Set.prototype, 'some', some);
