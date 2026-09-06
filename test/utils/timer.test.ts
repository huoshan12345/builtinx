import { Timer } from '@/utils/timer.js';

describe('Timer.every', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('yields after the configured interval', async () => {
    const iterator = Timer.every(100);
    const next = iterator.next();

    await vi.advanceTimersByTimeAsync(100);

    await expect(next).resolves.toEqual({ value: undefined, done: false });
    await iterator.return();
  });

  it.each([Number.NaN, Infinity, -1, 2_147_483_648])(
    'rejects an invalid interval of %s milliseconds',
    async interval => {
      const iterator = Timer.every(interval);

      await expect(iterator.next()).rejects.toThrow(RangeError);
    },
  );

  it('completes promptly when the signal aborts during a wait', async () => {
    const controller = new AbortController();
    const iterator = Timer.every(60_000, controller.signal);
    const next = iterator.next();

    controller.abort();

    await expect(next).resolves.toEqual({ value: undefined, done: true });
  });

  it('completes without waiting when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(Timer.every(100, controller.signal).next())
      .resolves.toEqual({ value: undefined, done: true });
  });
});
