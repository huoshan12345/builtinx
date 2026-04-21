import { definePropertyIfAbsent } from "@/utils/object";

declare global {
  interface Math {
    /**
     * Returns a random integer in the inclusive range [0, max].
     */
    randomInt(max: number): number;

    /**
     * Returns a random integer in the inclusive range [min, max].
     */
    randomInt(min: number, max: number): number;

    /**
     * Restricts a value to the inclusive range [min, max].
     *
     * If min > max, the values are swapped automatically.
     */
    clamp(value: number, min: number, max: number): number;

    /**
     * Linearly interpolates between start and end.
     *
     * t = 0 returns start  
     * t = 1 returns end
     */
    lerp(start: number, end: number, t: number): number;
  }
}

function randomInt(min: number, max?: number): number {
  if (max === undefined) {
    max = min;
    min = 0;
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new TypeError("min and max must be finite numbers.");
  }

  min = Math.ceil(min);
  max = Math.floor(max);

  if (max < min) {
    throw new RangeError("max must be greater than or equal to min.");
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
    throw new TypeError("Arguments must be finite numbers.");
  }

  if (min > max) {
    [min, max] = [max, min];
  }

  return Math.min(Math.max(value, min), max);
}

function lerp(start: number, end: number, t: number): number {
  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(t)) {
    throw new TypeError("Arguments must be finite numbers.");
  }

  return start + (end - start) * t;
};

definePropertyIfAbsent(Math, "randomInt", randomInt);
definePropertyIfAbsent(Math, "clamp", clamp);
definePropertyIfAbsent(Math, "lerp", lerp);