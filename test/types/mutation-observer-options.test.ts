import {
  MutationObserverDebounceOptions,
  MutationObserverOptions,
  type MutationExclusion,
} from '@/types/mutation-observer-options';

describe('MutationObserverOptions', () => {

  beforeEach(() => {
    MutationObserverOptions.default = { debounce: false };
    MutationObserverOptions.default = {
      debounce: {
        debounceMs: 1000,
        maxWaitMs: undefined,
        leading: true,
        trailing: true,
      },
    };
  });

  test('should initialize with default values', () => {
    const options = new MutationObserverOptions();

    expect(options.childList).toBe(true);
    expect(options.subtree).toBe(true);

    expect(options.debounce).toBeInstanceOf(MutationObserverDebounceOptions);
    expect(options.debounce?.debounceMs).toBe(1000);
    expect(options.debounce?.maxWaitMs).toBeUndefined();
    expect(options.debounce?.leading).toBe(true);
    expect(options.debounce?.trailing).toBe(true);
    expect(options.callOnStart).toBe(true);

    expect(options.exclusions).toEqual([]);
  });

  test('should accept exclusions as array', () => {
    const fn: MutationExclusion = () => true;

    const options = new MutationObserverOptions({
      exclusions: [fn]
    });

    expect(options.exclusions).toEqual([fn]);
  });

  test('should accept exclusions as transformer function', () => {
    const fn1: MutationExclusion = () => true;
    const fn2: MutationExclusion = () => false;

    const options = new MutationObserverOptions({
      exclusions: [fn1]
    });

    options.exclusions = (prev) => [...prev, fn2];

    expect(options.exclusions).toEqual([fn1, fn2]);
  });

  test('transformer should receive current exclusions', () => {
    const fn1: MutationExclusion = () => true;

    const options = new MutationObserverOptions({
      exclusions: [fn1]
    });

    const spy = vi.fn((prev) => prev);

    options.exclusions = spy;

    expect(spy).toHaveBeenCalledWith([fn1]);
  });

  test('should override exclusions when array is provided', () => {
    const fn1: MutationExclusion = () => true;
    const fn2: MutationExclusion = () => false;

    const options = new MutationObserverOptions({
      exclusions: [fn1]
    });

    options.exclusions = [fn2];

    expect(options.exclusions).toEqual([fn2]);
  });

  test('should merge static default with constructor options', () => {
    MutationObserverOptions.default = {
      debounce: {
        debounceMs: 500,
        leading: false,
      },
    };

    const options = new MutationObserverOptions({
      debounce: {
        leading: true,
      },
    });

    expect(options.debounce?.debounceMs).toBe(500);
    expect(options.debounce?.leading).toBe(true);
  });

  test('should accumulate static default', () => {
    MutationObserverOptions.default = {
      debounce: {
        debounceMs: 500,
      },
    };

    MutationObserverOptions.default = {
      debounce: {
        leading: false,
      },
    };

    const options = new MutationObserverOptions();

    expect(options.debounce?.debounceMs).toBe(500);
    expect(options.debounce?.leading).toBe(false);
  });

  test('should disable debounce explicitly', () => {
    const options = new MutationObserverOptions({
      debounce: false,
    });

    expect(options.debounce).toBeUndefined();
  });

  test('should allow an instance to re-enable a disabled global default', () => {
    MutationObserverOptions.default = {
      debounce: false,
    };

    expect(new MutationObserverOptions().debounce).toBeUndefined();

    const options = new MutationObserverOptions({
      debounce: {
        debounceMs: 250,
      },
    });

    expect(options.debounce).toBeInstanceOf(MutationObserverDebounceOptions);
    expect(options.debounce?.debounceMs).toBe(250);
  });

  test('toNativeInit should only include MutationObserverInit fields', () => {
    const options = new MutationObserverOptions({
      attributes: true,
      exclusions: m => m.append(x => true),
      debounce: {
        debounceMs: 2000,
        leading: false,
      },
    });

    const native = options.toNativeInit();

    expect(native).toEqual({
      attributeFilter: undefined,
      attributeOldValue: false,
      attributes: true,
      characterData: false,
      characterDataOldValue: false,
      childList: true,
      subtree: true
    });

    // 确保扩展字段没有泄漏
    expect((native as any).debounce).toBeUndefined();
  });

  test('should allow chaining transformer updates', () => {
    const fn1: MutationExclusion = () => true;
    const fn2: MutationExclusion = () => false;

    const options = new MutationObserverOptions();

    options.exclusions = (prev) => [...prev, fn1];
    options.exclusions = (prev) => [...prev, fn2];

    expect(options.exclusions).toEqual([fn1, fn2]);
  });

});
