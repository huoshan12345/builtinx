export type DebounceCallback<TArgs extends any[]> = (...args: TArgs) => void;

/**
 * Options for configuring the debounce behavior.
 */
export class DebounceOptions<TArgs extends any[]> {
  /** The number of milliseconds to delay; default is 1000ms. */
  debounceMs: number = 1000;
  /** If true, invokes the first call in a debounce window immediately; default is true. */
  leading: boolean = true;
  /** If true, invokes the final call in a debounce window after the delay; default is true. */
  trailing: boolean = true;
  /** An optional function that receives the arguments passed to the debounced function and returns true if the callback should be skipped for those arguments. */
  shouldSkip?: (...args: TArgs) => boolean;
  /** An optional function that will be called before the main callback is executed. */
  beforeCallback?: DebounceCallback<TArgs>;
  /** An optional function that will be called after the main callback is executed. */
  afterCallback?: DebounceCallback<TArgs>;
  /** An optional function that will be called when the callback is skipped. */
  onSkipped?: DebounceCallback<TArgs>;

  constructor(options: Partial<DebounceOptions<TArgs>>) {
    Object.assign(this, options);
  }
}
