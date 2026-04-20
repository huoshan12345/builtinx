import { describe, expect, it } from "vitest";
import "@/extensions/math";

describe("Math.randomInt", () => {
  it("returns integer in inclusive range [0, max] when one argument is provided", () => {
    for (let i = 0; i < 100; i++) {
      const value = Math.randomInt(5);

      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(5);
    }
  });

  it("returns integer in inclusive range [min, max] when two arguments are provided", () => {
    for (let i = 0; i < 100; i++) {
      const value = Math.randomInt(3, 7);

      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(7);
    }
  });

  it("returns the exact value when min equals max", () => {
    expect(Math.randomInt(4, 4)).toBe(4);
  });

  it("throws when max is less than min", () => {
    expect(() => Math.randomInt(10, 5)).toThrow(RangeError);
  });

  it("throws when arguments are not finite numbers", () => {
    expect(() => Math.randomInt(Infinity)).toThrow(TypeError);
    expect(() => Math.randomInt(1, NaN)).toThrow(TypeError);
  });
});

describe("Math.clamp", () => {
  it("returns value when already inside range", () => {
    expect(Math.clamp(5, 1, 10)).toBe(5);
  });

  it("clamps to min when value is too small", () => {
    expect(Math.clamp(-1, 1, 10)).toBe(1);
  });

  it("clamps to max when value is too large", () => {
    expect(Math.clamp(99, 1, 10)).toBe(10);
  });

  it("swaps min and max automatically", () => {
    expect(Math.clamp(5, 10, 1)).toBe(5);
    expect(Math.clamp(0, 10, 1)).toBe(1);
    expect(Math.clamp(99, 10, 1)).toBe(10);
  });

  it("throws when arguments are not finite numbers", () => {
    expect(() => Math.clamp(NaN, 1, 2)).toThrow(TypeError);
    expect(() => Math.clamp(1, Infinity, 2)).toThrow(TypeError);
  });
});

describe("Math.lerp", () => {
  it("returns start when t = 0", () => {
    expect(Math.lerp(10, 20, 0)).toBe(10);
  });

  it("returns end when t = 1", () => {
    expect(Math.lerp(10, 20, 1)).toBe(20);
  });

  it("returns midpoint when t = 0.5", () => {
    expect(Math.lerp(10, 20, 0.5)).toBe(15);
  });

  it("supports negative values", () => {
    expect(Math.lerp(-10, 10, 0.5)).toBe(0);
  });

  it("supports extrapolation", () => {
    expect(Math.lerp(10, 20, 2)).toBe(30);
    expect(Math.lerp(10, 20, -1)).toBe(0);
  });

  it("throws when arguments are not finite numbers", () => {
    expect(() => Math.lerp(NaN, 1, 0.5)).toThrow(TypeError);
    expect(() => Math.lerp(1, Infinity, 0.5)).toThrow(TypeError);
    expect(() => Math.lerp(1, 2, NaN)).toThrow(TypeError);
  });
});