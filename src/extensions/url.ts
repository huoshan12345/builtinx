import { Nullable, QueryParam, QueryParams } from '@/types/lib';
import { definePropertyIfAbsent } from '@/utils/object';

declare global {
  interface URL {
    /**
     * Sets a query parameter on the URL.
     *
     * Nullish values are converted to an empty string.
     * Other values are converted using `toString()`.
     * Empty values remove the key when `removeIfEmpty` is true.
     */
    setParam(key: string, value: unknown, removeIfEmpty?: boolean): URL;

    /**
     * Returns the last value of a query parameter.
     */
    getParam(key: string): string | null;

    /**
     * Returns the transformed last value of a query parameter.
     */
    getParam<T>(key: string, transform: (value: string) => T): Nullable<T>;

    /**
     * Returns the last value of a query parameter parsed as a number.
     *
     * Returns null when the key is missing or the value is not numeric.
     */
    getNumberParam(key: string): Nullable<number>;

    /**
     * Returns whether a query parameter exists.
     *
     * When `value` is provided, only the effective last value is compared.
     */
    hasParam(key: string, value?: string): boolean;

    /**
     * Sets query parameters from another iterable source using `set` semantics.
     */
    setParamsFrom(params: Iterable<QueryParam>): URL;

    /**
     * Deletes a query parameter and returns the URL.
     */
    deleteParam(key: string): URL;

    /**
     * Deletes a query parameter when it matches the optional value.
     */
    tryDeleteParam(key: string, value?: string): boolean;

    /**
     * Returns existing query parameters for the specified keys.
     */
    getParams(keys: Iterable<string>): QueryParams;

    /**
     * Sets a boolean query parameter using URLSearchParams boolean semantics.
     */
    setBool(key: string, value: boolean, removeIfFalse?: boolean): URL;

    /**
     * Navigates to this URL.
     */
    goto(openInNewTab?: boolean, noReferrer?: boolean): void;

    /**
     * Updates the hostname and optionally the port of the URL in place.
     */
    setHost(host: string, port?: number): URL;

    /**
     * Updates the protocol of the URL in place.
     *
     * A trailing colon is added automatically when missing.
     */
    setProtocol(protocol: string): URL;

    /**
     * Resolves a relative or absolute URL reference against this URL.
     */
    resolve(path: string): URL;
  }
}

function setParam(this: URL, key: string, value: unknown, removeIfEmpty: boolean = true) {
  const v = value == null ? "" : value.toString();
  if (!v && removeIfEmpty) {
    this.searchParams.delete(key);
  } else {
    this.searchParams.set(key, v);
  }

  return this;
};

function getParam(this: URL, key: string): string | null;
function getParam<T>(this: URL, key: string, transform?: (value: string) => T): T | null;
function getParam<T>(this: URL, key: string, transform?: (value: string) => T): T | string | null {
  const value = this.searchParams.getEffectiveValue(key);
  if (transform === undefined || value === null) {
    return value;
  } else {
    return transform(value);
  }
}

function getNumberParam(this: URL, key: string) {
  return this.getParam(key, value => {
    const number = Number(value);
    return Number.isNaN(number)
      ? null
      : number;
  });
};

function hasParam(this: URL, key: string, value?: string) {
  return value == undefined
    ? this.searchParams.has(key)
    : this.searchParams.hasEffectiveValue(key, value);
};

function setParamsFrom(this: URL, params: Iterable<QueryParam>) {
  this.searchParams.setFrom(params);
  return this;
};

function deleteParam(this: URL, key: string) {
  this.searchParams.delete(key);
  return this;
};

function tryDeleteParam(this: URL, key: string, value?: string) {
  if (this.hasParam(key, value)) {
    this.deleteParam(key);
    return true;
  }
  return false;
};

function getParams(this: URL, keys: Iterable<string>) {
  const arr: QueryParams = [];
  for (const key of keys) {
    const value = this.getParam(key);
    if (value !== null) {
      arr.push([key, value]);
    }
  }
  return arr;
};

function setBool(this: URL, key: string, value: boolean, removeIfFalse: boolean = true) {
  this.searchParams.setBool(key, value, removeIfFalse);
  return this;
};

function goto(this: URL, openInNewTab: boolean = false, noReferrer: boolean = false) {
  URLEx.goto(this, openInNewTab, noReferrer);
};

function setHost(this: URL, host: string, port?: number) {
  this.hostname = host;
  if (port !== undefined) {
    this.port = port.toString();
  }
  return this;
};

function setProtocol(this: URL, protocol: string) {
  if (protocol && !protocol.endsWith(':')) {
    protocol += ':';
  }
  this.protocol = protocol;
  return this;
};

function resolve(this: URL, path: string) {
  return new URL(path, this);
};

definePropertyIfAbsent(URL.prototype, 'setParam', setParam);
definePropertyIfAbsent(URL.prototype, 'getParam', getParam);
definePropertyIfAbsent(URL.prototype, 'getNumberParam', getNumberParam);
definePropertyIfAbsent(URL.prototype, 'hasParam', hasParam);
definePropertyIfAbsent(URL.prototype, 'setParamsFrom', setParamsFrom);
definePropertyIfAbsent(URL.prototype, 'deleteParam', deleteParam);
definePropertyIfAbsent(URL.prototype, 'tryDeleteParam', tryDeleteParam);
definePropertyIfAbsent(URL.prototype, 'getParams', getParams);
definePropertyIfAbsent(URL.prototype, 'setBool', setBool);
definePropertyIfAbsent(URL.prototype, 'goto', goto);
definePropertyIfAbsent(URL.prototype, 'setHost', setHost);
definePropertyIfAbsent(URL.prototype, 'setProtocol', setProtocol);
definePropertyIfAbsent(URL.prototype, 'resolve', resolve);
