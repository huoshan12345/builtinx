export type DebounceCallback<TArgs extends any[]> = (...args: TArgs) => void;

/**
 * Options for configuring the debounce behavior.
 */
export class DebounceOptions<TArgs extends any[]> {
  /** The number of milliseconds to delay; default is 1000ms. */
  debounceMs: number = 1000;
  /**
   * The maximum time a pending call may be delayed during continuous activity.
   *
   * This limit applies independently of `leading` and `trailing`. Values shorter than
   * `debounceMs` are treated as `debounceMs`. Omit it to disable the maximum wait.
   */
  maxWaitMs?: number;
  /** If true, invokes the first call in a debounce window immediately; default is true. */
  leading: boolean = true;
  /**
   * If true, invokes the final pending call after activity stops; default is true.
   *
   * Setting this to false does not disable invocations caused by `maxWaitMs`.
   */
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
