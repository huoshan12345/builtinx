/**
 * Represents a value created on first access.
 *
 * A factory result of `null` or `undefined` still counts as successful creation
 * and is cached until {@link reset} is called.
 */
export class Lazy<T> {
  #value: T | undefined;
  #isValueCreated = false;

  constructor(private readonly valueFactory: () => T) { }

  /** Gets the cached value, creating it on first access. */
  public get value(): T {
    if (!this.#isValueCreated) {
      const value = this.valueFactory();
      this.#value = value;
      this.#isValueCreated = true;
      return value;
    }

    return this.#value as T;
  }

  /** Returns whether the value factory has completed successfully. */
  public get isValueCreated(): boolean {
    return this.#isValueCreated;
  }

  /**
   * Discards the cached value without invoking the value factory.
   * The next access to {@link value} creates and caches a new value.
   */
  public reset(): void {
    this.#value = undefined;
    this.#isValueCreated = false;
  }
}
