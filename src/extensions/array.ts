import { definePropertyIfAbsent } from '@/internal/utils';

declare global {
  interface Array<T> {
    /**
    * Returns whether the specified index can access an element in this array.
    *
    * Supports negative indexes:
    * -1 = last element
    * -2 = second last element
    */
    hasIndex(index: number): boolean;

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
  }

  interface ArrayConstructor {
    cast<T>(iterable: Iterable<T> | ArrayLike<T>): Array<T>;
    isArrayLike<T>(value: unknown): value is ArrayLike<T>;
  }
}

function cast<T>(iterable: Iterable<T> | ArrayLike<T>) {
  const arr = iterable instanceof Array
    ? iterable as T[]
    : Array.from(iterable);
  return arr;
};

function isArrayLike<T>(value: unknown): value is ArrayLike<T> {
  return !!value &&
    typeof value === 'object' &&
    'length' in value &&
    typeof (value as any).length === 'number';
}

function hasIndex<T>(this: T[], index: number): boolean {
  if (!Number.isInteger(index)) {
    return false;
  }

  if (index < 0) {
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

definePropertyIfAbsent(Array, 'cast', cast);
definePropertyIfAbsent(Array, 'isArrayLike', isArrayLike);
definePropertyIfAbsent(Array.prototype, 'hasIndex', hasIndex);
definePropertyIfAbsent(Array.prototype, 'removeAt', removeAt);
