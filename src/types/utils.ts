export type DebounceCallback<TArgs extends any[]> = (...args: TArgs) => void;

/**
 * Options for configuring the debounce behavior.
 */
export class DebounceOptions<TArgs extends any[]> {
  /** If true, debug information will be logged to the console; default is false. */
  debug: boolean = false;
  /** The number of milliseconds to delay; default is 1000ms. */
  debounceMs: number = 1000;
  /** If true, the callback will be invoked on the leading edge of the timeout; default is false. */
  immediate: boolean = false;
  /** An optional function that receives the arguments passed to the debounced function and returns true if the callback should be skipped for those arguments. */
  shouldSkip?: (...args: TArgs) => boolean;

  constructor(options: Partial<DebounceOptions<TArgs>>) {
    Object.assign(this, options);
  }
}