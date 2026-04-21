import { Nullishable } from '@/types/lib';
import { definePropertyIfAbsent } from '@/utils/object';

declare global {
  interface URLSearchParams {
    /**
     * Returns the last value of the key parsed as a base-10 integer.
     *
     * Returns `defaultValue` when the key is missing, empty, or not a valid integer prefix.
     */
    getInt(key: string, defaultValue?: number): number;

    /**
     * Returns whether the last value of the key is equal to `"true"` ignoring ASCII case.
     *
     * Returns `defaultValue` when the key is missing or its value is empty.
     */
    getBool(key: string, defaultValue?: boolean): boolean;

    /**
     * Sets a boolean value for the key.
     *
     * When `removeIfFalse` is true, false removes the key instead of writing `"false"`.
     */
    setBool(key: string, value: boolean, removeIfFalse?: boolean): URLSearchParams;

    /**
     * Returns whether at least one query parameter exists.
     */
    any(): boolean;

    /**
     * Ensures each key appears at most once by keeping only its last value.
     */
    distinct(): URLSearchParams;

    /**
     * Sets values from another parameter source onto the current instance.
     *
     * Each incoming pair is applied using `set`, so later values overwrite earlier ones.
     */
    setFrom(params: Iterable<[string, string]>): URLSearchParams;

    /**
     * Returns the effective value of the key.
     *
     * When multiple values exist for the same key, only the last value is considered effective.
     */
    getEffectiveValue(key: string): string | null;

    /**
     * Returns whether the effective value of the key equals the specified value.
     *
     * When multiple values exist for the same key, only the last value is considered effective.
     */
    hasEffectiveValue(key: string, value: string): boolean;

    /**
     * Sets the value only when the key does not already exist.
     */
    trySet(name: string, value: string): URLSearchParams;

    /**
     * Appends one or more values for the key.
     *
     * Nullish values are appended as empty strings.
     */
    add(name: string, value: Nullishable<string> | Nullishable<string>[]): URLSearchParams;
  }
}

function getInt(this: URLSearchParams, key: string, defaultValue = 0): number {
  const v = this.get(key);
  if (v) {
    const num = Number.parseInt(v, 10);
    if (!Number.isNaN(num))
      return num;
  }
  return defaultValue;
};

function getBool(this: URLSearchParams, key: string, defaultValue = false): boolean {
  const v = this.get(key);
  if (v) {
    return v.equalsIgnoreAsciiCase("true");
  }
  return defaultValue;
};

function any(this: URLSearchParams): boolean {
  return this.keys().next().done === false;
};

function distinct(this: URLSearchParams): URLSearchParams {
  const keys = [...this.keys()].distinct();
  for (const key of keys) {
    const values = this.getAll(key);
    if (values.length > 1) {
      this.delete(key);
      this.set(key, values.last());
    }
  }
  return this;
};

function setFrom(this: URLSearchParams, params: Iterable<[string, string]>): URLSearchParams {
  for (const [key, value] of params) {
    this.set(key, value);
  }
  return this;
};

function getEffectiveValue(this: URLSearchParams, key: string): string | null {
  const values = this.getAll(key);
  // NOTE: This is a consequence of jsdom using vm contexts to execute JavaScript on the page. 
  // Each vm context has its own copy of the globals, including Array.
  // https://github.com/jsdom/jsdom/issues/2261
  const arr = Array.cast(values);
  return values.length > 0
    ? arr.last()
    : null;
};

function hasEffectiveValue(this: URLSearchParams, key: string, value: string): boolean {
  return this.getEffectiveValue(key) === value;
};

function setBool(this: URLSearchParams, key: string, value: boolean, removeIfFalse: boolean = true): URLSearchParams {
  if (value === false && removeIfFalse) {
    this.delete(key);
  } else {
    this.set(key, value.toString());
  }
  return this;
};

function trySet(this: URLSearchParams, name: string, value: string): URLSearchParams {
  if (!this.has(name)) {
    this.set(name, value);
  }
  return this;
};

function add(this: URLSearchParams, name: string, value: Nullishable<string> | Nullishable<string>[]): URLSearchParams {
  if (Array.isArray(value)) {
    for (const v of value) {
      this.append(name, v ?? '');
    }
  } else {
    this.append(name, value ?? '');
  }
  return this;
};

definePropertyIfAbsent(URLSearchParams.prototype, "getInt", getInt);
definePropertyIfAbsent(URLSearchParams.prototype, "getBool", getBool);
definePropertyIfAbsent(URLSearchParams.prototype, "setBool", setBool);
definePropertyIfAbsent(URLSearchParams.prototype, "any", any);
definePropertyIfAbsent(URLSearchParams.prototype, "distinct", distinct);
definePropertyIfAbsent(URLSearchParams.prototype, "setFrom", setFrom);
definePropertyIfAbsent(URLSearchParams.prototype, "getEffectiveValue", getEffectiveValue);
definePropertyIfAbsent(URLSearchParams.prototype, "hasEffectiveValue", hasEffectiveValue);
definePropertyIfAbsent(URLSearchParams.prototype, "trySet", trySet);
definePropertyIfAbsent(URLSearchParams.prototype, "add", add);
