import { TimeSpan } from '@/utils/time-span';

export namespace Timer {
  export async function* every(timeSpan: TimeSpan | number) {
    const ms = typeof timeSpan === 'number'
      ? timeSpan
      : timeSpan.totalMilliseconds;
    while (true) {
      await Promise.delay(ms);
      yield;
    }
  }
}
