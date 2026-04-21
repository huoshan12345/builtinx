import { Nullishable } from '@/types/lib';
import { definePropertyIfAbsent } from '@/utils/object';

declare global {
  interface URLSearchParams {
    getInt(key: string, defaultValue?: number): number;
    getBool(key: string, defaultValue?: boolean): boolean;
    setBool(key: string, value: boolean, removeIfFalse?: boolean): URLSearchParams;
    any(): boolean;
    distinct(): void;
    from(params: [string, string][] | URLSearchParams): URLSearchParams;
    contains(key: string, value: string): boolean;
    trySet(name: string, value: string): URLSearchParams;
    add(name: string, value: Nullishable<string> | Nullishable<string>[]): URLSearchParams;
  }
}

function getInt(this: URLSearchParams, key: string, defaultValue = 0): number {
  const v = this.get(key);
  if (v) {
    const num = parseInt(v);
    if (!isNaN(num))
      return num;
  }
  return defaultValue;
};

function getBool(this: URLSearchParams, key: string, defaultValue = false): boolean {
  const v = this.get(key);
  if (v) {
    return v === 'true';
  }
  return defaultValue;
};

function any(this: URLSearchParams): boolean {
  return this.keys().next().done === false;
};

function distinct(this: URLSearchParams): URLSearchParams {
  for (const key of this.keys()) {
    const values = this.getAll(key);
    if (values.length > 1) {
      this.delete(key);
      this.set(key, values.last());
    }
  }
  return this;
};

function from(this: URLSearchParams, params: [string, string][] | URLSearchParams): URLSearchParams {
  for (const [key, value] of params) {
    this.set(key, value);
  }
  return this;
};

function contains(this: URLSearchParams, key: string, value: string): boolean {
  const values = this.getAll(key);
  // NOTE: This is a consequence of jsdom using vm contexts to execute JavaScript on the page. 
  // Each vm context has its own copy of the globals, including Array.
  // https://github.com/jsdom/jsdom/issues/2261
  const arr = Array.cast(values);
  return values.length > 0 && arr.last() === value;
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
      this.append(name, v || '');
    }
  } else {
    this.append(name, value || '');
  }
  return this;
};

definePropertyIfAbsent(URLSearchParams.prototype, "getInt", getInt);
definePropertyIfAbsent(URLSearchParams.prototype, "getBool", getBool);
definePropertyIfAbsent(URLSearchParams.prototype, "setBool", setBool);
definePropertyIfAbsent(URLSearchParams.prototype, "any", any);
definePropertyIfAbsent(URLSearchParams.prototype, "distinct", distinct);
definePropertyIfAbsent(URLSearchParams.prototype, "from", from);
definePropertyIfAbsent(URLSearchParams.prototype, "contains", contains);
definePropertyIfAbsent(URLSearchParams.prototype, "trySet", trySet);
definePropertyIfAbsent(URLSearchParams.prototype, "add", add);