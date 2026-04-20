import { describe, expect, it } from "vitest";
import "@/extensions/array";

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