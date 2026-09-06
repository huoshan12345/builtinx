import { Lazy } from '@/utils/lazy.js';

describe('Lazy', () => {
  it('caches null as a successfully created value', () => {
    const factory = vi.fn(() => null);
    const lazy = new Lazy(factory);

    expect(lazy.isValueCreated).toBe(false);
    expect(lazy.value).toBeNull();
    expect(lazy.value).toBeNull();
    expect(lazy.isValueCreated).toBe(true);
    expect(factory).toHaveBeenCalledOnce();
  });

  it('caches undefined as a successfully created value', () => {
    const factory = vi.fn(() => undefined);
    const lazy = new Lazy(factory);

    expect(lazy.value).toBeUndefined();
    expect(lazy.value).toBeUndefined();
    expect(lazy.isValueCreated).toBe(true);
    expect(factory).toHaveBeenCalledOnce();
  });

  it('reset discards the cached value without invoking the factory', () => {
    let nextValue = 0;
    const factory = vi.fn(() => ++nextValue);
    const lazy = new Lazy(factory);

    expect(lazy.value).toBe(1);
    lazy.reset();

    expect(lazy.isValueCreated).toBe(false);
    expect(factory).toHaveBeenCalledOnce();
    expect(lazy.value).toBe(2);
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
