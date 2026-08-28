import {
  MutationObserverDebounceOptions,
  MutationObserverOptions,
  type MutationExclusion,
} from '@/types/mutation-observer-options';

describe('MutationObserverOptions defaults', () => {
  test('should initialize with the declared defaults', () => {
    const options = new MutationObserverOptions();

    expect(options.attributeFilter).toBeUndefined();
    expect(options.attributeOldValue).toBe(false);
    expect(options.attributes).toBe(false);
    expect(options.characterData).toBe(false);
    expect(options.characterDataOldValue).toBe(false);
    expect(options.childList).toBe(true);
    expect(options.subtree).toBe(true);
    expect(options.callOnStart).toBe(true);
    expect(options.beforeCallback).toBeUndefined();
    expect(options.afterCallback).toBeUndefined();
    expect(options.onSkipped).toBeUndefined();
    expect(options.exclusions).toEqual([]);

    expect(options.debounce).toBeInstanceOf(MutationObserverDebounceOptions);
    expect(options.debounce?.debounceMs).toBe(1000);
    expect(options.debounce?.maxWaitMs).toBe(1000);
    expect(options.debounce?.leading).toBe(true);
    expect(options.debounce?.trailing).toBe(true);
  });

  test('should initialize debounce options with their declared defaults', () => {
    const options = new MutationObserverDebounceOptions();

    expect(options.debounceMs).toBe(1000);
    expect(options.maxWaitMs).toBe(1000);
    expect(options.leading).toBe(true);
    expect(options.trailing).toBe(true);
  });
});

describe('MutationObserverOptions', () => {

  beforeEach(() => {
    MutationObserverOptions.default = {
      attributeFilter: undefined,
      attributeOldValue: false,
      attributes: false,
      characterData: false,
      characterDataOldValue: false,
      childList: true,
      subtree: true,
      callOnStart: true,
      beforeCallback: undefined,
      afterCallback: undefined,
      onSkipped: undefined,
      exclusions: [],
      debounce: false,
    };
    MutationObserverOptions.default = {
      debounce: {
        debounceMs: 1000,
        maxWaitMs: 1000,
        leading: true,
        trailing: true,
      },
    };
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

  test('should clear exclusions when assigned an empty array', () => {
    const options = new MutationObserverOptions({
      exclusions: [() => true],
    });

    options.exclusions = [];

    expect(options.exclusions).toEqual([]);
  });

  test('should apply a transformer to an empty exclusion list', () => {
    const fn: MutationExclusion = () => true;
    const options = new MutationObserverOptions({
      exclusions: current => [...current, fn],
    });

    expect(options.exclusions).toEqual([fn]);
  });

  test('should allow a transformer to remove exclusions', () => {
    const keep: MutationExclusion = () => false;
    const remove: MutationExclusion = () => true;
    const options = new MutationObserverOptions({
      exclusions: [keep, remove],
    });

    options.exclusions = current => current.filter(exclusion => exclusion !== remove);

    expect(options.exclusions).toEqual([keep]);
  });

  test('should clear exclusions when a transformer returns an empty array', () => {
    const options = new MutationObserverOptions({
      exclusions: [() => true],
    });

    options.exclusions = () => [];

    expect(options.exclusions).toEqual([]);
  });

  test('should preserve exclusions when a transformer throws', () => {
    const fn: MutationExclusion = () => true;
    const options = new MutationObserverOptions({
      exclusions: [fn],
    });

    expect(() => {
      options.exclusions = () => {
        throw new Error('transform failed');
      };
    }).toThrow('transform failed');

    expect(options.exclusions).toEqual([fn]);
  });

  test('should apply an instance transformer to global default exclusions', () => {
    const defaultExclusion: MutationExclusion = () => true;
    const instanceExclusion: MutationExclusion = () => false;
    MutationObserverOptions.default = {
      exclusions: [defaultExclusion],
    };

    const options = new MutationObserverOptions({
      exclusions: current => [...current, instanceExclusion],
    });

    expect(options.exclusions).toEqual([defaultExclusion, instanceExclusion]);
  });

  test('should let an instance array replace global default exclusions', () => {
    const defaultExclusion: MutationExclusion = () => true;
    const instanceExclusion: MutationExclusion = () => false;
    MutationObserverOptions.default = {
      exclusions: [defaultExclusion],
    };

    const options = new MutationObserverOptions({
      exclusions: [instanceExclusion],
    });

    expect(options.exclusions).toEqual([instanceExclusion]);
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

  test('should preserve a disabled global debounce when unrelated defaults are updated', () => {
    MutationObserverOptions.default = {
      debounce: false,
    };
    MutationObserverOptions.default = {
      callOnStart: false,
    };

    expect(MutationObserverOptions.default.debounce).toBe(false);
    expect(new MutationObserverOptions().debounce).toBeUndefined();
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
