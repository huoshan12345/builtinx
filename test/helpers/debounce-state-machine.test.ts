import { debounceWithStateMachine } from '@/helpers/debounce-state-machine';
import { debounce } from '@/helpers/utils';
import type { DebounceCallback, DebounceOptions } from '@/types/debounce-options';

type DebounceFactory = <TArgs extends any[]>(
  callback: DebounceCallback<TArgs>,
  options: Partial<DebounceOptions<TArgs>>,
) => DebounceCallback<TArgs>;

const implementations: [string, DebounceFactory][] = [
  ['existing implementation', debounce],
  ['state-machine implementation', debounceWithStateMachine],
];

describe.each(implementations)('%s', (_, createDebounced) => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  test('debounces rapid calls on the trailing edge', () => {
    const callback = vi.fn();
    const debounced = createDebounced(callback, {
      leading: false,
      debounceMs: 100,
    });

    debounced(1);
    vi.advanceTimersByTime(80);
    debounced(2);
    vi.advanceTimersByTime(80);
    debounced(3);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledExactlyOnceWith(3);
  });

  test('invokes both leading and trailing calls', () => {
    const callback = vi.fn();
    const debounced = createDebounced(callback, {
      debounceMs: 100,
      leading: true,
      trailing: true,
    });

    debounced(1);
    debounced(2);

    expect(callback).toHaveBeenCalledExactlyOnceWith(1);

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(2);
  });

  test('uses maxWaitMs independently of trailing', () => {
    const callback = vi.fn();
    const debounced = createDebounced(callback, {
      debounceMs: 100,
      maxWaitMs: 250,
      leading: true,
      trailing: false,
    });

    debounced(1);
    vi.advanceTimersByTime(80);
    debounced(2);
    vi.advanceTimersByTime(80);
    debounced(3);
    vi.advanceTimersByTime(80);
    debounced(4);
    vi.advanceTimersByTime(90);

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(4);

    debounced(5);
    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('does not let skipped calls affect the active window', () => {
    const events: string[] = [];
    const debounced = createDebounced(
      value => events.push(`callback:${value}`),
      {
        leading: false,
        debounceMs: 100,
        shouldSkip: value => value < 0,
        onSkipped: value => events.push(`skipped:${value}`),
        beforeCallback: value => events.push(`before:${value}`),
        afterCallback: value => events.push(`after:${value}`),
      },
    );

    debounced(1);
    vi.advanceTimersByTime(50);
    debounced(-1);
    vi.advanceTimersByTime(50);

    expect(events).toEqual([
      'skipped:-1',
      'before:1',
      'callback:1',
      'after:1',
    ]);
  });

  test('does nothing when both edges are disabled', () => {
    const callback = vi.fn();
    const debounced = createDebounced(callback, {
      leading: false,
      trailing: false,
      maxWaitMs: 100,
    });

    debounced(1);
    vi.advanceTimersByTime(1000);

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('debounceWithStateMachine equivalence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  const optionMatrix: Partial<DebounceOptions<[number]>>[] = [
    { leading: false, trailing: false },
    { leading: false, trailing: true },
    { leading: true, trailing: false },
    { leading: true, trailing: true },
    { leading: false, trailing: false, maxWaitMs: 250 },
    { leading: false, trailing: true, maxWaitMs: 250 },
    { leading: true, trailing: false, maxWaitMs: 250 },
    { leading: true, trailing: true, maxWaitMs: 250 },
  ];

  test.each(optionMatrix)('matches debounce for %o', options => {
    const existingCallback = vi.fn<(value: number) => void>();
    const stateMachineCallback = vi.fn<(value: number) => void>();
    const existing = debounce(existingCallback, {
      debounceMs: 100,
      ...options,
    });
    const stateMachine = debounceWithStateMachine(stateMachineCallback, {
      debounceMs: 100,
      ...options,
    });

    const invokeBoth = (value: number) => {
      existing(value);
      stateMachine(value);
    };

    invokeBoth(1);
    vi.advanceTimersByTime(80);
    invokeBoth(2);
    vi.advanceTimersByTime(80);
    invokeBoth(3);
    vi.advanceTimersByTime(80);
    invokeBoth(4);
    vi.advanceTimersByTime(90);
    invokeBoth(5);
    vi.advanceTimersByTime(100);
    invokeBoth(6);
    vi.advanceTimersByTime(1000);

    expect(stateMachineCallback.mock.calls).toEqual(existingCallback.mock.calls);
  });
});
