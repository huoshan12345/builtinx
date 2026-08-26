describe("Array.cast", () => {
  it("returns same array instance when input is array", () => {
    const arr = [1, 2, 3];

    const result = Array.cast(arr);

    expect(result).toBe(arr);
    expect(result).toEqual([1, 2, 3]);
  });

  it("converts string to character array", () => {
    const result = Array.cast("abc");

    expect(result).toEqual(["a", "b", "c"]);
  });

  it("converts Set to array", () => {
    const result = Array.cast(new Set([1, 2, 3]));

    expect(result).toEqual([1, 2, 3]);
  });

  it("converts Map keys iterator to array", () => {
    const map = new Map([
      ["a", 1],
      ["b", 2]
    ]);

    const result = Array.cast(map.keys());

    expect(result).toEqual(["a", "b"]);
  });

  it("converts typed array to normal array", () => {
    const input = new Uint8Array([5, 6, 7]);

    const result = Array.cast(input);

    expect(result).toEqual([5, 6, 7]);
    expect(Array.isArray(result)).toBe(true);
  });

  it("converts array-like object", () => {
    const input = {
      0: "x",
      1: "y",
      length: 2
    };

    const result = Array.cast(input);

    expect(result).toEqual(["x", "y"]);
  });

  it("returns empty array for empty array-like object", () => {
    const result = Array.cast({ length: 0 });

    expect(result).toEqual([]);
  });
});

describe("Array.isArrayLike", () => {
  it("returns true for arrays", () => {
    expect(Array.isArrayLike([1, 2, 3])).toBe(true);
  });

  it("returns true for strings", () => {
    expect(Array.isArrayLike("abc")).toBe(true);
  });

  it("returns true for typed arrays", () => {
    expect(Array.isArrayLike(new Uint8Array(3))).toBe(true);
  });

  it("returns true for array-like objects", () => {
    expect(
      Array.isArrayLike({
        0: "a",
        1: "b",
        length: 2
      })
    ).toBe(true);
  });

  it("returns true for empty array-like objects", () => {
    expect(Array.isArrayLike({ length: 0 })).toBe(true);
  });

  it("returns false for null and undefined", () => {
    expect(Array.isArrayLike(null)).toBe(false);
    expect(Array.isArrayLike(undefined)).toBe(false);
  });

  it("returns false for numbers", () => {
    expect(Array.isArrayLike(123)).toBe(false);
  });

  it("returns false for plain objects without length", () => {
    expect(Array.isArrayLike({ a: 1 })).toBe(false);
  });

  it("returns false for negative length", () => {
    expect(Array.isArrayLike({ length: -1 })).toBe(false);
  });

  it("returns false for decimal length", () => {
    expect(Array.isArrayLike({ length: 1.5 })).toBe(false);
  });
});

describe("Array.prototype.hasIndex", () => {
  it("returns true for valid positive indexes", () => {
    const arr = [10, 20, 30];

    expect(arr.hasIndex(0)).toBe(true);
    expect(arr.hasIndex(2)).toBe(true);
  });

  it("returns false for out of range positive indexes", () => {
    const arr = [10, 20, 30];

    expect(arr.hasIndex(3)).toBe(false);
    expect(arr.hasIndex(99)).toBe(false);
  });

  it("supports negative indexes", () => {
    const arr = [10, 20, 30];

    expect(arr.hasIndex(-1)).toBe(true);
    expect(arr.hasIndex(-2)).toBe(true);
    expect(arr.hasIndex(-3)).toBe(true);
    expect(arr.hasIndex(-4)).toBe(false);
  });

  it("returns false for non-integer values", () => {
    const arr = [10, 20, 30];

    expect(arr.hasIndex(1.5)).toBe(false);
    expect(arr.hasIndex(NaN)).toBe(false);
  });

  it("returns false for empty arrays", () => {
    const arr: number[] = [];

    expect(arr.hasIndex(0)).toBe(false);
    expect(arr.hasIndex(-1)).toBe(false);
  });
});

describe("Array.prototype.insert", () => {
  it("inserts at the beginning, middle, and end", () => {
    const beginning = [2, 3];
    const middle = [1, 3];
    const end = [1, 2];
    const empty: number[] = [];

    expect(beginning.insert(0, 1)).toBe(beginning);
    middle.insert(1, 2);
    end.insert(end.length, 3);
    empty.insert(0, 1);

    expect(beginning).toEqual([1, 2, 3]);
    expect(middle).toEqual([1, 2, 3]);
    expect(end).toEqual([1, 2, 3]);
    expect(empty).toEqual([1]);
  });

  it("supports negative indexes using splice semantics", () => {
    const values = [1, 2, 3];

    values.insert(-1, 9);

    expect(values).toEqual([1, 2, 9, 3]);
  });

  it("does nothing for out-of-range indexes", () => {
    const values = [1, 2];

    values.insert(3, 3);
    values.insert(-3, 0);
    values.insert(1.5, 9);

    expect(values).toEqual([1, 2]);
  });
});

describe("Array.prototype.prepend", () => {
  it("inserts an item at the beginning and returns the array", () => {
    const values = [2, 3];

    expect(values.prepend(1)).toBe(values);
    expect(values).toEqual([1, 2, 3]);
  });
});

describe("Array.prototype.removeAt", () => {
  it("removes and returns item by positive index", () => {
    const arr = ["a", "b", "c"];

    expect(arr.removeAt(1)).toBe("b");
    expect(arr).toEqual(["a", "c"]);
  });

  it("removes and returns item by negative index", () => {
    const arr = ["a", "b", "c"];

    expect(arr.removeAt(-1)).toBe("c");
    expect(arr).toEqual(["a", "b"]);
  });

  it("supports negative middle index", () => {
    const arr = ["a", "b", "c"];

    expect(arr.removeAt(-2)).toBe("b");
    expect(arr).toEqual(["a", "c"]);
  });

  it("returns undefined when index is out of range", () => {
    const arr = ["a", "b"];

    expect(arr.removeAt(5)).toBeUndefined();
    expect(arr.removeAt(-3)).toBeUndefined();
    expect(arr).toEqual(["a", "b"]);
  });

  it("returns undefined for non-integer index", () => {
    const arr = ["a", "b"];

    expect(arr.removeAt(1.2)).toBeUndefined();
    expect(arr).toEqual(["a", "b"]);
  });

  it("works with single-element arrays", () => {
    const arr = ["x"];

    expect(arr.removeAt(-1)).toBe("x");
    expect(arr).toEqual([]);
  });
});

describe("Array.prototype.remove", () => {
  it("removes the first occurrence of the specified item", () => {
    const arr = ["a", "b", "c", "b"];

    expect(arr.remove("b")).toBe(true);
    expect(arr).toEqual(["a", "c", "b"]);
  });

  it("returns false if the item is not found", () => {
    const arr = ["a", "b", "c"];

    expect(arr.remove("x")).toBe(false);
    expect(arr).toEqual(["a", "b", "c"]);
  });

  it("works with single-element arrays", () => {
    const arr = ["x"];

    expect(arr.remove("x")).toBe(true);
    expect(arr).toEqual([]);
  });
});

describe("Array.prototype.throwIfEmpty", () => {
  it("does not throw for non-empty arrays", () => {
    expect(() => [1].throwIfEmpty()).not.toThrow();
    expect(() => [1, 2, 3].throwIfEmpty()).not.toThrow();
  });

  it("throws for empty arrays", () => {
    expect(() => [].throwIfEmpty()).toThrow(RangeError);
    expect(() => [].throwIfEmpty()).toThrow("The array is empty.");
  });

  it("returns the same array instance", () => {
    const arr = [1, 2, 3];

    const result = arr.throwIfEmpty();

    expect(result).toBe(arr);
  });

  it("supports chaining", () => {
    const arr = [10, 20, 30];

    const removed = arr.throwIfEmpty().removeAt(0);

    expect(removed).toBe(10);
    expect(arr).toEqual([20, 30]);
  });

  it("works with arrays containing falsy values", () => {
    expect(() => [0].throwIfEmpty()).not.toThrow();
    expect(() => [false].throwIfEmpty()).not.toThrow();
    expect(() => [null].throwIfEmpty()).not.toThrow();
    expect(() => [undefined].throwIfEmpty()).not.toThrow();
    expect(() => [""].throwIfEmpty()).not.toThrow();
  });

  it("throws after all elements are removed", () => {
    const arr = [1];

    arr.removeAt(0);

    expect(() => arr.throwIfEmpty()).toThrow(RangeError);
  });
});

describe("Array.prototype.sample", () => {
  it("returns undefined for empty arrays", () => {
    expect([].sample()).toBeUndefined();
  });

  it("returns the only element for single-element arrays", () => {
    expect([42].sample()).toBe(42);
    expect(["x"].sample()).toBe("x");
  });

  it("returns an existing element from the array", () => {
    const arr = [10, 20, 30];

    const result = arr.sample();

    expect(arr).toContain(result);
  });

  it("works with string arrays", () => {
    const arr = ["a", "b", "c"];

    const result = arr.sample();

    expect(arr).toContain(result);
  });

  it("works with object arrays", () => {
    const a = { id: 1 };
    const b = { id: 2 };
    const arr = [a, b];

    const result = arr.sample();

    expect(arr).toContain(result);
  });

  it("can return different values across multiple calls", () => {
    const arr = [1, 2, 3, 4, 5];

    const results = new Set<number>();

    for (let i = 0; i < 100; i++) {
      results.add(arr.sample()!);
    }

    for (const value of results) {
      expect(arr).toContain(value);
    }

    expect(results.size).toBeGreaterThan(1);
  });

  it("does not modify the original array", () => {
    const arr = [1, 2, 3];

    arr.sample();

    expect(arr).toEqual([1, 2, 3]);
  });

  it("works with duplicate values", () => {
    const arr = [1, 1, 2, 2];

    const result = arr.sample();

    expect(arr).toContain(result);
  });
});

describe("Array.prototype.first", () => {
  it("returns first element", () => {
    expect([1, 2, 3].first()).toBe(1);
  });

  it("works with single-element arrays", () => {
    expect(["x"].first()).toBe("x");
  });

  it("returns the first element that satisfies the predicate", () => {
    const values = [1, 2, 3, 4];
    const predicate = vi.fn((value: number, index: number, array: readonly number[]) => {
      expect(array).toBe(values);
      return value % 2 === 0 && index > 0;
    });

    expect(values.first(predicate)).toBe(2);
    expect(predicate).toHaveBeenCalledTimes(2);
    expect(predicate).toHaveBeenNthCalledWith(1, 1, 0, values);
    expect(predicate).toHaveBeenNthCalledWith(2, 2, 1, values);
  });

  it("treats a null predicate as no predicate", () => {
    expect([1, 2, 3].first(null)).toBe(1);
  });

  it("throws for empty arrays", () => {
    expect(() => [].first()).toThrow(RangeError);
  });

  it("throws when no element satisfies the predicate", () => {
    expect(() => [1, 2, 3].first(value => value > 3)).toThrow(RangeError);
  });

  it("does not modify original array", () => {
    const arr = [1, 2, 3];

    arr.first();

    expect(arr).toEqual([1, 2, 3]);
  });
});

describe("Array.prototype.last", () => {
  it("returns last element", () => {
    expect([1, 2, 3].last()).toBe(3);
  });

  it("works with single-element arrays", () => {
    expect(["x"].last()).toBe("x");
  });

  it("returns the last element that satisfies the predicate", () => {
    const values = [1, 2, 3, 4];
    const predicate = vi.fn((value: number, index: number, array: readonly number[]) => {
      expect(array).toBe(values);
      return value <= 2;
    });

    expect(values.last(predicate)).toBe(2);
    expect(predicate).toHaveBeenCalledTimes(3);
    expect(predicate).toHaveBeenNthCalledWith(1, 4, 3, values);
    expect(predicate).toHaveBeenNthCalledWith(2, 3, 2, values);
    expect(predicate).toHaveBeenNthCalledWith(3, 2, 1, values);
  });

  it("treats a null predicate as no predicate", () => {
    expect([1, 2, 3].last(null)).toBe(3);
  });

  it("throws for empty arrays", () => {
    expect(() => [].last()).toThrow(RangeError);
  });

  it("throws when no element satisfies the predicate", () => {
    expect(() => [1, 2, 3].last(value => value > 3)).toThrow(RangeError);
  });

  it("does not modify original array", () => {
    const arr = [1, 2, 3];

    arr.last();

    expect(arr).toEqual([1, 2, 3]);
  });
});

describe("Array.prototype.firstOrNull", () => {
  it("returns the first element when no predicate is supplied", () => {
    expect([1, 2, 3].firstOrNull()).toBe(1);
    expect([1, 2, 3].firstOrNull(null)).toBe(1);
  });

  it("returns the first matching element", () => {
    const values = [1, 2, 3, 4];

    expect(values.firstOrNull((value, index, array) => {
      expect(array).toBe(values);
      return value % 2 === 0 && index > 0;
    })).toBe(2);
  });

  it("returns null for empty arrays and when no element matches", () => {
    expect([].firstOrNull()).toBeNull();
    expect([1, 2, 3].firstOrNull(value => value > 3)).toBeNull();
  });
});

describe("Array.prototype.lastOrNull", () => {
  it("returns the last element when no predicate is supplied", () => {
    expect([1, 2, 3].lastOrNull()).toBe(3);
    expect([1, 2, 3].lastOrNull(null)).toBe(3);
  });

  it("returns the last matching element", () => {
    const values = [1, 2, 3, 4];

    expect(values.lastOrNull((value, index, array) => {
      expect(array).toBe(values);
      return value <= 2 && index < 2;
    })).toBe(2);
  });

  it("returns null for empty arrays and when no element matches", () => {
    expect([].lastOrNull()).toBeNull();
    expect([1, 2, 3].lastOrNull(value => value > 3)).toBeNull();
  });
});

describe("Array.prototype.distinct", () => {
  it("removes duplicate numbers", () => {
    expect([1, 1, 2, 3, 2].distinct()).toEqual([1, 2, 3]);
  });

  it("removes duplicate strings", () => {
    expect(["a", "a", "b", "c", "b"].distinct()).toEqual(["a", "b", "c"]);
  });

  it("returns empty array for empty arrays", () => {
    expect([].distinct()).toEqual([]);
  });

  it("preserves original order of first occurrence", () => {
    expect([3, 1, 2, 1, 3].distinct()).toEqual([3, 1, 2]);
  });

  it("does not modify original array", () => {
    const arr = [1, 1, 2];

    const result = arr.distinct();

    expect(arr).toEqual([1, 1, 2]);
    expect(result).toEqual([1, 2]);
  });

  it("handles null and undefined", () => {
    expect([null, undefined, null, undefined].distinct()).toEqual([
      null,
      undefined
    ]);
  });

  it("treats object references as unique values", () => {
    const a = { id: 1 };
    const b = { id: 1 };

    expect([a, a, b].distinct()).toEqual([a, b]);
  });

  it("handles NaN correctly", () => {
    expect([NaN, NaN, 1].distinct()).toHaveLength(2);
    expect([NaN, NaN, 1].distinct()[1]).toBe(1);
  });
});

describe("Array.prototype.groupBy", () => {
  it("groups numbers by parity", () => {
    const result = [1, 2, 3, 4].groupBy(x => x % 2);

    expect(result.get(0)).toEqual([2, 4]);
    expect(result.get(1)).toEqual([1, 3]);
  });

  it("groups strings by length", () => {
    const result = ["a", "bb", "c", "dd"].groupBy(x => x.length);

    expect(result.get(1)).toEqual(["a", "c"]);
    expect(result.get(2)).toEqual(["bb", "dd"]);
  });

  it("returns empty map for empty arrays", () => {
    const result = [].groupBy(x => x);

    expect(result.size).toBe(0);
  });

  it("preserves insertion order of keys", () => {
    const result = [3, 1, 2].groupBy(x => x);

    expect([...result.keys()]).toEqual([3, 1, 2]);
  });

  it("supports object keys", () => {
    const key = { id: 1 };

    const result = [1, 2].groupBy(() => key);

    expect(result.get(key)).toEqual([1, 2]);
  });

  it("does not modify original array", () => {
    const arr = [1, 2, 3];

    arr.groupBy(x => x % 2);

    expect(arr).toEqual([1, 2, 3]);
  });
});

describe("Array.prototype.countBy", () => {
  it("counts numbers by parity", () => {
    const result = [1, 2, 3, 4, 5].countBy(x => x % 2);

    expect(result.get(1)).toBe(3);
    expect(result.get(0)).toBe(2);
  });

  it("counts strings by length", () => {
    const result = ["a", "bb", "c", "dd"].countBy(x => x.length);

    expect(result.get(1)).toBe(2);
    expect(result.get(2)).toBe(2);
  });

  it("returns empty map for empty arrays", () => {
    expect([].countBy(x => x).size).toBe(0);
  });

  it("preserves insertion order of keys", () => {
    const result = [3, 1, 2, 1].countBy(x => x);

    expect([...result.keys()]).toEqual([3, 1, 2]);
  });

  it("supports object keys", () => {
    const key = { id: 1 };

    const result = [1, 2, 3].countBy(() => key);

    expect(result.get(key)).toBe(3);
  });
});

describe("Array.prototype.count", () => {
  it("returns array length when no predicate is provided", () => {
    expect([1, 2, 3].count()).toBe(3);
    expect([].count()).toBe(0);
  });

  it("counts matching elements", () => {
    expect([1, 2, 3, 4].count(x => x % 2 === 0)).toBe(2);
  });

  it("returns zero when no elements match", () => {
    expect([1, 3, 5].count(x => x % 2 === 0)).toBe(0);
  });

  it("returns all when all elements match", () => {
    expect([2, 4, 6].count(x => x % 2 === 0)).toBe(3);
  });

  it("passes index to predicate", () => {
    const result = ["a", "b", "c"].count((_, i) => i >= 1);

    expect(result).toBe(2);
  });

  it("does not modify original array", () => {
    const arr = [1, 2, 3];

    arr.count(x => x > 1);

    expect(arr).toEqual([1, 2, 3]);
  });
});

describe("Array.prototype.resize", () => {
  it("expands an empty array", () => {
    const arr: number[] = [];

    arr.resize(3);

    expect(arr).toEqual([undefined, undefined, undefined]);
    expect(arr.length).toBe(3);
  });

  it("expands and preserves existing elements", () => {
    const arr = [1, 2];

    arr.resize(5);

    expect(arr).toEqual([1, 2, undefined, undefined, undefined]);
  });

  it("shrinks an array", () => {
    const arr = [1, 2, 3, 4, 5];

    arr.resize(2);

    expect(arr).toEqual([1, 2]);
    expect(arr.length).toBe(2);
  });

  it("does nothing when resized to same length", () => {
    const arr = [1, 2, 3];

    arr.resize(3);

    expect(arr).toEqual([1, 2, 3]);
  });

  it("returns the same array instance", () => {
    const arr = [1, 2, 3];

    const result = arr.resize(5);

    expect(result).toBe(arr);
  });

  it("can be chained", () => {
    const arr = [1, 2, 3];

    arr.resize(5).removeAt(0);

    expect(arr).toEqual([2, 3, undefined, undefined]);
  });

  it("works with string arrays", () => {
    const arr = ["a"];

    arr.resize(3);

    expect(arr).toEqual(["a", undefined, undefined]);
  });

  it("works with object arrays", () => {
    const item = { id: 1 };
    const arr = [item];

    arr.resize(2);

    expect(arr[0]).toBe(item);
    expect(arr[1]).toBeUndefined();
  });

  it("resizes to zero", () => {
    const arr = [1, 2, 3];

    arr.resize(0);

    expect(arr).toEqual([]);
  });

  it("throws for negative size", () => {
    const arr = [1, 2, 3];

    expect(() => arr.resize(-1)).toThrow(RangeError);
  });

  it("throws for decimal size", () => {
    const arr = [1, 2, 3];

    expect(() => arr.resize(1.5)).toThrow(RangeError);
  });

  it("throws for NaN", () => {
    const arr = [1, 2, 3];

    expect(() => arr.resize(Number.NaN)).toThrow(RangeError);
  });

  it("throws for Infinity", () => {
    const arr = [1, 2, 3];

    expect(() => arr.resize(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("Array.prototype.replaceFrom", () => {
  it("replaces contents", () => {
    const arr = [1, 2, 3];

    arr.replaceFrom([4, 5]);

    expect(arr).toEqual([4, 5]);
  });

  it("preserves reference", () => {
    const arr = [1];
    const ref = arr;

    arr.replaceFrom([2, 3]);

    expect(arr).toBe(ref);
  });

  it("returns same instance", () => {
    const arr = [1];

    expect(arr.replaceFrom([2])).toBe(arr);
  });

  it("supports empty values", () => {
    const arr = [1, 2];

    arr.replaceFrom([]);

    expect(arr).toEqual([]);
  });

  it("supports iterable input", () => {
    const arr = [1];

    arr.replaceFrom(new Set([3, 4]));

    expect(arr).toEqual([3, 4]);
  });

  it("can be chained", () => {
    const arr = [1, 2];

    arr.replaceFrom([5, 6]).removeAt(0);

    expect(arr).toEqual([6]);
  });
});

describe("Array.prototype.swap", () => {
  it("should swap two positive indexes", () => {
    const arr = [1, 2, 3];

    arr.swap(0, 2);

    expect(arr).toEqual([3, 2, 1]);
  });

  it("should swap two middle indexes", () => {
    const arr = [1, 2, 3, 4];

    arr.swap(1, 2);

    expect(arr).toEqual([1, 3, 2, 4]);
  });

  it("should support negative indexes", () => {
    const arr = [1, 2, 3, 4];

    arr.swap(-1, 0);

    expect(arr).toEqual([4, 2, 3, 1]);
  });

  it("should support two negative indexes", () => {
    const arr = [1, 2, 3, 4];

    arr.swap(-1, -3);

    expect(arr).toEqual([1, 4, 3, 2]);
  });

  it("should do nothing when first index is out of range", () => {
    const arr = [1, 2, 3];

    arr.swap(10, 1);

    expect(arr).toEqual([1, 2, 3]);
  });

  it("should do nothing when second index is out of range", () => {
    const arr = [1, 2, 3];

    arr.swap(1, -10);

    expect(arr).toEqual([1, 2, 3]);
  });

  it("should do nothing when both indexes are out of range", () => {
    const arr = [1, 2, 3];

    arr.swap(10, -10);

    expect(arr).toEqual([1, 2, 3]);
  });

  it("should do nothing when swapping same positive index", () => {
    const arr = [1, 2, 3];

    arr.swap(1, 1);

    expect(arr).toEqual([1, 2, 3]);
  });

  it("should do nothing when swapping equivalent positive and negative indexes", () => {
    const arr = [1, 2, 3];

    arr.swap(0, -3);

    expect(arr).toEqual([1, 2, 3]);
  });

  it("should return the same array instance", () => {
    const arr = [1, 2, 3];

    const result = arr.swap(0, 1);

    expect(result).toBe(arr);
  });

  it("should work with string arrays", () => {
    const arr = ["a", "b", "c"];

    arr.swap(0, -1);

    expect(arr).toEqual(["c", "b", "a"]);
  });

  it("should work with empty array", () => {
    const arr: number[] = [];

    arr.swap(0, -1);

    expect(arr).toEqual([]);
  });

  it("should work with single element array", () => {
    const arr = [1];

    arr.swap(0, -1);

    expect(arr).toEqual([1]);
  });
});

describe("Array.prototype pattern methods", () => {
  const values = ["apple pie", "banana split", "orange juice"];
  const selector = (x: string) => x;

  describe("anyContainsAny", () => {
    it("returns true when one selected value contains one pattern", () => {
      expect(values.anyContainsAny(["apple", "zzz"], selector)).toBe(true);
      expect(values.anyContainsAny([/^banana/i], selector)).toBe(true);
    });

    it("returns false when the array or patterns are empty", () => {
      expect(values.anyContainsAny([], selector)).toBe(false);
      expect([].anyContainsAny(["apple"], selector)).toBe(false);
    });
  });

  describe("anyContainsAll", () => {
    it("requires one selected value to contain every pattern", () => {
      expect(values.anyContainsAll(["apple", "pie"], selector)).toBe(true);
      expect(values.anyContainsAll(["apple", "banana"], selector)).toBe(false);
    });

    it("uses existential semantics for an empty pattern set", () => {
      expect(values.anyContainsAll([], selector)).toBe(true);
      expect([].anyContainsAll([], selector)).toBe(false);
    });
  });

  describe("allContainsAny", () => {
    it("allows different selected values to contain different patterns", () => {
      expect(values.allContainsAny(["apple", "banana", "orange"], selector)).toBe(true);
      expect(values.allContainsAny(["apple", "banana"], selector)).toBe(false);
    });

    it("uses universal semantics for an empty array", () => {
      expect([].allContainsAny(["apple"], selector)).toBe(true);
      expect(values.allContainsAny([], selector)).toBe(false);
    });
  });

  describe("allContainsAll", () => {
    it("requires every selected value to contain every pattern", () => {
      const allRedAndBig = ["red big car", "red big bus", "red big bike"];
      const missingBig = ["red big car", "red car", "red big bike"];

      expect(allRedAndBig.allContainsAll(["red", "big"], selector)).toBe(true);
      expect(missingBig.allContainsAll(["red", "big"], selector)).toBe(false);
    });

    it("returns true when either quantified set is empty", () => {
      expect(values.allContainsAll([], selector)).toBe(true);
      expect([].allContainsAll(["apple"], selector)).toBe(true);
    });
  });
});
