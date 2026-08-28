import { MutationObserverOptions, type MutationExclusion } from '@/types/mutation-observer';

describe('MutationObserverOptions', () => {

  beforeEach(() => {
    // 重置全局 default，避免测试污染
    MutationObserverOptions.default = {};
  });

  test('should initialize with default values', () => {
    const options = new MutationObserverOptions();

    expect(options.childList).toBe(true);
    expect(options.subtree).toBe(true);

    expect(options.debounceMs).toBe(1000);
    expect(options.maxWaitMs).toBeNull();
    expect(options.leading).toBe(true);
    expect(options.trailing).toBe(true);
    expect(options.callOnStart).toBe(true);

    expect(options.resolvedExclusions).toEqual([]);
  });

  test('should accept exclusions as array', () => {
    const fn: MutationExclusion = () => true;

    const options = new MutationObserverOptions({
      exclusions: [fn]
    });

    expect(options.resolvedExclusions).toEqual([fn]);
  });

  test('should accept exclusions as transformer function', () => {
    const fn1: MutationExclusion = () => true;
    const fn2: MutationExclusion = () => false;

    const options = new MutationObserverOptions({
      exclusions: [fn1]
    });

    options.exclusions = (prev) => [...prev, fn2];

    expect(options.resolvedExclusions).toEqual([fn1, fn2]);
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

    expect(options.resolvedExclusions).toEqual([fn2]);
  });

  test('should merge static default with constructor options', () => {
    MutationObserverOptions.default = {
      debounceMs: 500,
      leading: false
    };

    const options = new MutationObserverOptions({
      leading: true
    });

    expect(options.debounceMs).toBe(500);   // 来自 default
    expect(options.leading).toBe(true);   // 被 constructor 覆盖
  });

  test('should accumulate static default', () => {
    MutationObserverOptions.default = {
      debounceMs: 500
    };

    MutationObserverOptions.default = {
      leading: false
    };

    const options = new MutationObserverOptions();

    expect(options.debounceMs).toBe(500);
    expect(options.leading).toBe(false);
  });

  test('toNativeInit should only include MutationObserverInit fields', () => {
    const options = new MutationObserverOptions({
      attributes: true,
      debounceMs: 2000,
      leading: false
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
    expect((native as any).debounceMs).toBeUndefined();
    expect((native as any).maxWaitMs).toBeUndefined();
  });

  test('should allow chaining transformer updates', () => {
    const fn1: MutationExclusion = () => true;
    const fn2: MutationExclusion = () => false;

    const options = new MutationObserverOptions();

    options.exclusions = (prev) => [...prev, fn1];
    options.exclusions = (prev) => [...prev, fn2];

    expect(options.resolvedExclusions).toEqual([fn1, fn2]);
  });

});
