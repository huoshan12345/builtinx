import { debounce } from '@/helpers/utils';

describe('debounce (enhanced)', () => {

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  test('should debounce (trailing only, default)', () => {
    const fn = vi.fn();

    const debounced = debounce(fn, {});

    debounced(1);
    debounced(2);
    debounced(3);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });

  test('should call beforeCallback and afterCallback', () => {
    const fn = vi.fn();
    const before = vi.fn();
    const after = vi.fn();

    const debounced = debounce(fn, {
      beforeCallback: before,
      afterCallback: after
    });

    debounced(1);

    vi.advanceTimersByTime(1000);

    expect(before).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(after).toHaveBeenCalledTimes(1);

    // 调用顺序
    expect(before.mock.invocationCallOrder[0])
      .toBeLessThan(fn.mock.invocationCallOrder[0]);

    expect(fn.mock.invocationCallOrder[0])
      .toBeLessThan(after.mock.invocationCallOrder[0]);
  });

  test('should skip execution when shouldSkip returns true', () => {
    const fn = vi.fn();
    const skipped = vi.fn();

    const debounced = debounce(fn, {
      shouldSkip: (x: number) => x === 2,
      onSkipped: skipped
    });

    debounced(2);

    vi.advanceTimersByTime(1000);

    expect(fn).not.toHaveBeenCalled();
    expect(skipped).toHaveBeenCalledTimes(1);
    expect(skipped).toHaveBeenCalledWith(2);
  });

  test('should not schedule timer when skipped', () => {
    const fn = vi.fn();

    const debounced = debounce(fn, {
      shouldSkip: () => true
    });

    debounced();

    vi.advanceTimersByTime(2000);

    expect(fn).not.toHaveBeenCalled();
  });

  test('should execute immediately when immediate=true', () => {
    const fn = vi.fn();

    const debounced = debounce(fn, {
      immediate: true
    });

    debounced(1);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1);
  });

  test('should trigger trailing call when immediate=true and called again', () => {
    const fn = vi.fn();

    const debounced = debounce(fn, {
      immediate: true
    });

    debounced(1); // leading
    debounced(2); // schedule trailing

    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(2);
  });

  test('should reset timer on rapid calls (trailing)', () => {
    const fn = vi.fn();

    const debounced = debounce(fn, {
      debounceMs: 100
    });

    debounced(1);
    vi.advanceTimersByTime(50);

    debounced(2);
    vi.advanceTimersByTime(50);

    debounced(3);
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });

  test('should pass arguments to before/after callbacks', () => {
    const before = vi.fn();
    const after = vi.fn();
    const fn = vi.fn();

    const debounced = debounce(fn, {
      beforeCallback: before,
      afterCallback: after
    });

    debounced(1, 'a');

    vi.advanceTimersByTime(1000);

    expect(before).toHaveBeenCalledWith(1, 'a');
    expect(fn).toHaveBeenCalledWith(1, 'a');
    expect(after).toHaveBeenCalledWith(1, 'a');
  });

  test('should support multiple argument types (type safety)', () => {
    const fn = vi.fn<(a: number, b: string, c: boolean) => void>();

    const debounced = debounce(fn, {});

    debounced(1, 'x', true);

    vi.advanceTimersByTime(1000);

    expect(fn).toHaveBeenCalledWith(1, 'x', true);
  });

  test('should use custom debounceMs', () => {
    const fn = vi.fn();

    const debounced = debounce(fn, {
      debounceMs: 200
    });

    debounced(1);

    vi.advanceTimersByTime(199);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

});