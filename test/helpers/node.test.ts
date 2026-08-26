describe('debounceMutationCallback', () => {

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  function createMutation(type: MutationRecordType): MutationRecord {
    return { type } as MutationRecord;
  }

  test('should pass through mutations when no exclusions', () => {
    const callback = vi.fn();

    const debounced = BuiltinX.Node.debounceMutationCallback(callback, {});

    const mutations = [createMutation('attributes'), createMutation('characterData')];

    debounced(mutations, {} as MutationObserver);

    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(mutations, expect.anything());
  });

  test('should filter excluded mutations', () => {
    const callback = vi.fn();

    const debounced = BuiltinX.Node.debounceMutationCallback(callback, {
      exclusions: [
        m => m.type === 'childList'
      ]
    });

    const mutations = [
      createMutation('attributes'),
      createMutation('childList'),
      createMutation('characterData')
    ];

    debounced(mutations, {} as MutationObserver);

    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledTimes(1);

    const result = callback.mock.calls[0][0];

    expect(result).toHaveLength(2);
    expect(result.map((m: MutationRecord) => m.type))
      .toEqual(['attributes', 'characterData']);
  });

  test('should mutate original array (in-place)', () => {
    const callback = vi.fn();

    const debounced = BuiltinX.Node.debounceMutationCallback(callback, {
      exclusions: [m => m.type === 'attributes']
    });

    const mutations = [
      createMutation('attributes'),
      createMutation('characterData')
    ];

    debounced(mutations, {} as MutationObserver);

    vi.advanceTimersByTime(1000);

    // 原数组被修改
    expect(mutations).toHaveLength(1);
    expect(mutations[0].type).toBe('characterData');
  });

  test('should skip callback when all mutations excluded', () => {
    const callback = vi.fn();
    const onSkipped = vi.fn();

    const debounced = BuiltinX.Node.debounceMutationCallback(callback, {
      exclusions: [() => true],
      onSkipped
    });

    const mutations = [createMutation('attributes')];

    debounced(mutations, {} as MutationObserver);

    vi.advanceTimersByTime(1000);

    expect(callback).not.toHaveBeenCalled();
    expect(onSkipped).toHaveBeenCalledTimes(1);
  });

  test('should call beforeCallback and afterCallback', () => {
    const callback = vi.fn();
    const before = vi.fn();
    const after = vi.fn();

    const debounced = BuiltinX.Node.debounceMutationCallback(callback, {
      beforeCallback: before,
      afterCallback: after
    });

    const mutations = [createMutation('attributes')];

    debounced(mutations, {} as MutationObserver);

    vi.advanceTimersByTime(1000);

    expect(before).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(after).toHaveBeenCalledTimes(1);

    expect(before.mock.invocationCallOrder[0])
      .toBeLessThan(callback.mock.invocationCallOrder[0]);

    expect(callback.mock.invocationCallOrder[0])
      .toBeLessThan(after.mock.invocationCallOrder[0]);
  });

  test('should execute immediately when leading=true', () => {
    const callback = vi.fn();

    const debounced = BuiltinX.Node.debounceMutationCallback(callback, {
      leading: true,
      trailing: false,
    });

    const mutations = [createMutation('attributes')];

    debounced(mutations, {} as MutationObserver);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should debounce multiple calls on the trailing edge', () => {
    const callback = vi.fn();

    const debounced = BuiltinX.Node.debounceMutationCallback(callback, {
      debounceMs: 100,
      leading: false,
    });

    const m1 = [createMutation('attributes')];
    const m2 = [createMutation('characterData')];

    debounced(m1, {} as MutationObserver);
    debounced(m2, {} as MutationObserver);

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);

    const result = callback.mock.calls[0][0];
    expect(result[0].type).toBe('characterData');
  });

  test('should apply exclusions before skip decision', () => {
    const callback = vi.fn();
    const onSkipped = vi.fn();

    const debounced = BuiltinX.Node.debounceMutationCallback(callback, {
      exclusions: [m => m.type !== 'characterData'],
      onSkipped
    });

    const mutations = [
      createMutation('attributes'),
      createMutation('characterData')
    ];

    debounced(mutations, {} as MutationObserver);

    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledTimes(1);

    const result = callback.mock.calls[0][0];
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('characterData');
  });

});
