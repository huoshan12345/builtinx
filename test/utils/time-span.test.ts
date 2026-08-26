import { TimeSpan } from '@/utils/time-span';

describe('TimeSpan validation', () => {
  it('accepts only finite safe integer milliseconds in the constructor', () => {
    expect(new TimeSpan(42).totalMilliseconds).toBe(42);

    expect(() => new TimeSpan(Number.NaN)).toThrow(RangeError);
    expect(() => new TimeSpan(Infinity)).toThrow(RangeError);
    expect(() => new TimeSpan(0.5)).toThrow(RangeError);
    expect(() => new TimeSpan(Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
  });

  it('rejects non-finite factory inputs before rounding', () => {
    expect(() => TimeSpan.fromMilliseconds(Number.NaN)).toThrow(RangeError);
    expect(() => TimeSpan.fromSeconds(Infinity)).toThrow(RangeError);
  });

  it('validates the total produced by from', () => {
    expect(() => TimeSpan.from(0, 0, 0, 0, Number.NaN)).toThrow(RangeError);
    expect(() => TimeSpan.from(0, 0, 0, 0, Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError);
  });

  it('validates arithmetic results through the constructor', () => {
    expect(() => TimeSpan.maxValue.add(TimeSpan.fromMilliseconds(1))).toThrow(RangeError);
    expect(() => TimeSpan.minValue.subtract(TimeSpan.fromMilliseconds(1))).toThrow(RangeError);
  });
});
