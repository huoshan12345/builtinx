export class Lazy<T> {
  #value?: T;
  constructor(private valueFactory: () => T) { }
  public get value(): T {
    return (this.#value ??= this.valueFactory());
  }

  public get isValueCreated(): boolean {
    return this.#value !== undefined;
  }
}