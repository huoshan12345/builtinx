import type { MatchPattern } from '@/types/lib';
import { definePropertyIfAbsent } from '@/helpers/utils';

type ArrayPredicate<T> = (value: T, index: number, array: readonly T[]) => boolean;

declare global {
  interface Array<T> {
    /**
     * Checks if the array has an element at the specified index.
     *
     * Supports negative indexes:
     * -1 = last element
     * -2 = second last element
     *
     * @param disallowNegative If true, negative indexes are not allowed and will return false.
     */
    hasIndex(index: number, disallowNegative?: boolean): boolean;

    /**
     * Removes and returns the element at the specified index.
     *
     * Supports negative indexes:
     * -1 = last element
     * -2 = second last element
     *
     * Returns undefined when index is out of range.
     */
    removeAt(index: number): T | undefined;

    /**
     * Removes the first occurrence of the specified item from the array.
     *
     * Returns true if an element was removed, or false if the item was not found.
     */
    remove(item: T): boolean;

    /**
     * Throws an error if the array is empty.
     *
     * This method is useful when an operation requires at least one element.
     *
     * @throws {RangeError} When the array contains no elements.
     */
    throwIfEmpty<T>(): T[];

    /**
     * Returns a random element from the array.
     *
     * Returns undefined if the array is empty.
     */
    sample(): T | undefined;

    /**
     * Returns the first element of the array that satisfies an optional predicate.
     *
     * @throws {RangeError} When the array is empty or no element satisfies the predicate.
     */
    first(predicate?: ArrayPredicate<T> | null): T;

    /**
     * Returns the first element of the array that satisfies an optional predicate, or null when none exists.
     */
    firstOrNull(predicate?: ArrayPredicate<T> | null): T | null;

    /**
     * Returns the last element of the array that satisfies an optional predicate.
     *
     * @throws {RangeError} When the array is empty or no element satisfies the predicate.
     */
    last(predicate?: ArrayPredicate<T> | null): T;

    /**
     * Returns the last element of the array that satisfies an optional predicate, or null when none exists.
     */
    lastOrNull(predicate?: ArrayPredicate<T> | null): T | null;

    /**
     * Returns a new array containing distinct elements.
     *
     * Element equality is determined by SameValueZero semantics,
     * the same behavior used by Set.
     */
    distinct(): T[];

    /**
     * Groups array elements by a key selector.
     *
     * Returns a Map whose keys are produced by the selector,
     * and values are arrays containing matching elements.
     */
    groupBy<TKey>(selector: (item: T) => TKey): Map<TKey, T[]>;

    /**
     * Appends an item to the end of the array and returns the array.
     */
    append<T>(this: T[], item: T): T[];

    /**
     * Inserts an item at the specified index and returns the array.
     *
     * Supports negative indexes using `splice` semantics: -1 inserts before the last item.
     * Does nothing when the index is out of range. The index equal to the array length appends the item.
     */
    insert(index: number, item: T): this;

    /**
     * Inserts an item at the beginning of the array and returns the array.
     */
    prepend(item: T): this;

    /**
     * Counts elements by key.
     *
     * Returns a Map whose keys are produced by the selector,
     * and values are the number of matching elements.
     */
    countBy<TKey>(selector: (item: T) => TKey): Map<TKey, number>;

    /**
     * Returns the number of elements in the array.
     *
     * If a predicate is provided, returns the number of elements
     * that satisfy the condition.
     */
    count(predicate?: (item: T, index: number, array: readonly T[]) => boolean): number;

    /**
     * Resizes the array in place.
     *
     * If the new size is greater than the current size,
     * new elements are filled with undefined.
     *
     * If the new size is smaller, extra elements are removed.
     *
     * @throws {RangeError} When newSize is negative or not an integer.
     */
    resize(newSize: number): this;

    /**
     * Replaces all elements of the array in place
     * while preserving the original array reference.
     */
    replaceFrom(values: Iterable<T>): this;

    /**
     * Swaps the elements at the specified indexes.
     * Supports negative indexes:
     * -1 = last element
     * -2 = second last element
     *
     * Does nothing if any of the indexes is out of range.
     */
    swap(i: number, j: number): this;

    /**
     * Returns whether any selected string value contains any of the specified patterns.
     *
     * Returns false when `patterns` is empty.
     */
    anyContainsAny(patterns: MatchPattern[], selector: (t: T) => string): boolean;

    /**
     * Returns whether any selected string value contains all of the specified patterns.
     *
     * Returns false when the array is empty, and true when `patterns` is empty and the array is non-empty.
     */
    anyContainsAll(patterns: MatchPattern[], selector: (t: T) => string): boolean;

    /**
     * Returns whether all selected string values contain any of the specified patterns.
     *
     * Returns true when the array is empty, and false when `patterns` is empty and the array is non-empty.
     */
    allContainsAny(patterns: MatchPattern[], selector: (t: T) => string): boolean;

    /**
     * Returns whether all selected string values contain all of the specified patterns.
     *
     * Returns true when `patterns` is empty.
     */
    allContainsAll(patterns: MatchPattern[], selector: (t: T) => string): boolean;
  }

  interface ArrayConstructor {
    /**
     * Converts an iterable or array-like value to an array.
     *
     * If the input is already an array, the original instance is returned.
     */
    cast<T>(iterable: Iterable<T> | ArrayLike<T>): Array<T>;

    /**
     * Returns whether the specified value is array-like.
     *
     * A value is considered array-like when it has:
     * - a non-negative integer `length` property
     * - indexed element access semantics
     */
    isArrayLike<T>(value: unknown): value is ArrayLike<T>;
  }
}

function cast<T>(value: Iterable<T> | ArrayLike<T>): T[] {
  return Array.isArray(value)
    ? value
    : Array.from(value);
}

function isArrayLike<T>(value: unknown): value is ArrayLike<T> {
  if (value == null) {
    return false;
  }

  if (typeof value === "string") {
    return true;
  }

  if (typeof value !== "object") {
    return false;
  }

  const length = (value as ArrayLike<T>).length;

  return Number.isSafeInteger(length)
    && length >= 0;
}

function hasIndex<T>(this: T[], index: number, disallowNegative?: boolean): boolean {
  if (!Number.isInteger(index)) {
    return false;
  }

  if (!disallowNegative && index < 0) {
    index += this.length;
  }

  return index >= 0 && index < this.length;
};

function removeAt<T>(this: T[], index: number): T | undefined {
  if (!this.hasIndex(index)) {
    return undefined;
  }

  return this.splice(index, 1)[0];
}

function remove<T>(this: T[], item: T): boolean {
  const index = this.indexOf(item);
  if (index === -1) {
    return false;
  }

  this.removeAt(index);
  return true;
};

function throwIfEmpty<T>(this: T[]): T[] {
  if (this.length === 0) {
    throw new RangeError("The array is empty.");
  }

  return this;
};

function sample<T>(this: T[]): T | undefined {
  if (this.length === 0) {
    return undefined;
  }

  const index = Math.randomInt(0, this.length - 1);
  return this[index];
};

function first<T>(this: T[], predicate?: ArrayPredicate<T> | null): T {
  if (predicate == null) {
    this.throwIfEmpty();
    return this[0];
  }

  for (let index = 0; index < this.length; index++) {
    const value = this[index];
    if (predicate(value, index, this)) {
      return value;
    }
  }

  throw new RangeError("No element satisfies the predicate.");
}

function firstOrNull<T>(this: T[], predicate?: ArrayPredicate<T> | null): T | null {
  if (predicate == null) {
    return this.length === 0 ? null : this[0];
  }

  for (let index = 0; index < this.length; index++) {
    const value = this[index];
    if (predicate(value, index, this)) {
      return value;
    }
  }

  return null;
}

function last<T>(this: T[], predicate?: ArrayPredicate<T> | null): T {
  if (predicate == null) {
    this.throwIfEmpty();
    return this[this.length - 1];
  }

  for (let index = this.length - 1; index >= 0; index--) {
    const value = this[index];
    if (predicate(value, index, this)) {
      return value;
    }
  }

  throw new RangeError("No element satisfies the predicate.");
};

function lastOrNull<T>(this: T[], predicate?: ArrayPredicate<T> | null): T | null {
  if (predicate == null) {
    return this.length === 0 ? null : this[this.length - 1];
  }

  for (let index = this.length - 1; index >= 0; index--) {
    const value = this[index];
    if (predicate(value, index, this)) {
      return value;
    }
  }

  return null;
}

function distinct<T>(this: T[]): T[] {
  return [...new Set(this)];
};

function groupBy<T, TKey>(this: T[], selector: (item: T) => TKey): Map<TKey, T[]> {
  const map = new Map<TKey, T[]>();
  for (const item of this) {
    const key = selector(item);
    let group = map.get(key);
    if (group === undefined) {
      group = [];
      map.set(key, group);
    }
    group.push(item);
  }
  return map;
};

function countBy<T, TKey>(this: T[], selector: (item: T) => TKey): Map<TKey, number> {
  const map = new Map<TKey, number>();

  for (const item of this) {
    const key = selector(item);
    const count = map.get(key) ?? 0;

    map.set(key, count + 1);
  }

  return map;
};

function append<T>(this: T[], item: T) {
  this.push(item);
  return this;
};

function insert<T>(this: T[], index: number, item: T) {
  if (this.hasIndex(index) || index === this.length) {
    this.splice(index, 0, item);
  }
  return this;
}

function prepend<T>(this: T[], item: T) {
  return this.insert(0, item);
}

function count<T>(this: T[],
  predicate?: (item: T, index: number, array: readonly T[]) => boolean
): number {
  if (!predicate) {
    return this.length;
  }

  let count = 0;

  for (let i = 0; i < this.length; i++) {
    if (predicate(this[i], i, this)) {
      count++;
    }
  }

  return count;
};

function resize<T>(this: T[], newSize: number): T[] {
  if (!Number.isSafeInteger(newSize) || newSize < 0) {
    throw new RangeError("newSize must be a non-negative integer.");
  }

  const oldSize = this.length;

  if (newSize > oldSize) {
    this.length = newSize;
    this.fill(undefined as T, oldSize, newSize);
  } else if (newSize < oldSize) {
    this.length = newSize;
  }

  return this;
}

function replaceFrom<T>(this: T[], values: Iterable<T>): T[] {
  this.length = 0;
  for (const item of values) {
    this.push(item);
  }
  return this;
};

function swap<T>(this: T[], i: number, j: number): T[] {
  i = i >= 0 ? i : this.length + i;
  j = j >= 0 ? j : this.length + j;

  if (i === j) {
    return this;
  }

  if (!this.hasIndex(i, true) || !this.hasIndex(j, true)) {
    return this;
  }

  // indexed access does not support negative indexes, so we have to adjust them beforehand
  const temp = this[i];
  this[i] = this[j];
  this[j] = temp;

  return this;
};

function anyContainsAny<T>(this: T[], patterns: MatchPattern[], selector: (t: T) => string) {
  const values = this.map(selector);
  return values.some(value => patterns.some(pattern => value.contains(pattern)));
};

function anyContainsAll<T>(this: T[], patterns: MatchPattern[], selector: (t: T) => string) {
  const values = this.map(selector);
  return values.some(value => patterns.every(pattern => value.contains(pattern)));
};

function allContainsAny<T>(this: T[], patterns: MatchPattern[], selector: (t: T) => string) {
  const values = this.map(selector);
  return values.every(value => patterns.some(pattern => value.contains(pattern)));
};

function allContainsAll<T>(this: T[], patterns: MatchPattern[], selector: (t: T) => string) {
  const values = this.map(selector);
  return values.every(value => patterns.every(pattern => value.contains(pattern)));
};

definePropertyIfAbsent(Array, 'cast', cast);
definePropertyIfAbsent(Array, 'isArrayLike', isArrayLike);
definePropertyIfAbsent(Array.prototype, 'hasIndex', hasIndex);
definePropertyIfAbsent(Array.prototype, 'removeAt', removeAt);
definePropertyIfAbsent(Array.prototype, 'throwIfEmpty', throwIfEmpty);
definePropertyIfAbsent(Array.prototype, 'sample', sample);
definePropertyIfAbsent(Array.prototype, 'first', first);
definePropertyIfAbsent(Array.prototype, 'firstOrNull', firstOrNull);
definePropertyIfAbsent(Array.prototype, 'last', last);
definePropertyIfAbsent(Array.prototype, 'lastOrNull', lastOrNull);
definePropertyIfAbsent(Array.prototype, 'distinct', distinct);
definePropertyIfAbsent(Array.prototype, 'groupBy', groupBy);
definePropertyIfAbsent(Array.prototype, 'append', append);
definePropertyIfAbsent(Array.prototype, 'insert', insert);
definePropertyIfAbsent(Array.prototype, 'prepend', prepend);
definePropertyIfAbsent(Array.prototype, 'countBy', countBy);
definePropertyIfAbsent(Array.prototype, 'count', count);
definePropertyIfAbsent(Array.prototype, 'resize', resize);
definePropertyIfAbsent(Array.prototype, 'replaceFrom', replaceFrom);
definePropertyIfAbsent(Array.prototype, 'swap', swap);
definePropertyIfAbsent(Array.prototype, 'anyContainsAny', anyContainsAny);
definePropertyIfAbsent(Array.prototype, 'anyContainsAll', anyContainsAll);
definePropertyIfAbsent(Array.prototype, 'allContainsAny', allContainsAny);
definePropertyIfAbsent(Array.prototype, 'allContainsAll', allContainsAll);
definePropertyIfAbsent(Array.prototype, 'remove', remove);
