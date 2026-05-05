import { debounce } from '@/helpers/utils';

describe('debounce', () => {

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'debug').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  test('should debounce calls (trailing)', () => {
    const fn = vi.fn();

    const debounced = debounce(fn, {
      debug: false,
      debounceMs: 100,
      immediate: false
    });

    debounced(1);
    debounced(2);
    debounced(3);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });

  test('should execute immediately when immediate=true', () => {
    const fn = vi.fn();

    const debounced = debounce(fn, {
      debug: false,
      debounceMs: 100,
      immediate: true
    });

    debounced(1);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1);
  });

  test('should trigger trailing call when immediate=true and called again', () => {
    const fn = vi.fn();

    const debounced = debounce(fn, {
      debug: false,
      debounceMs: 100,
      immediate: true
    });

    debounced(1); // immediate
    debounced(2); // schedule trailing

    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(2);
  });

  test('should reset timer on rapid calls', () => {
    const fn = vi.fn();

    const debounced = debounce(fn, {
      debug: false,
      debounceMs: 100,
      immediate: false
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

  test('should skip execution when shouldSkip returns true', () => {
    const fn = vi.fn();

    const debounced = debounce(fn, {
      debug: false,
      debounceMs: 100,
      immediate: false,
      shouldSkip: (x: number) => x === 2
    });

    debounced(2);

    vi.advanceTimersByTime(100);

    expect(fn).not.toHaveBeenCalled();
  });

  test('should log when debug=true', () => {
    const fn = vi.fn();

    const debounced = debounce(fn, {
      debug: true,
      debounceMs: 100,
      immediate: false
    });

    debounced(1);

    vi.advanceTimersByTime(100);

    expect(console.debug).toHaveBeenCalled();
  });

  test('should preserve argument types', () => {
    const fn = vi.fn<(a: number, b: string) => void>();

    const debounced = debounce(fn, {
      debug: false,
      debounceMs: 100,
      immediate: false
    });

    debounced(1, 'test');

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith(1, 'test');
  });

});