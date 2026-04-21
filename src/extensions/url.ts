import { Nullable, QueryParam, QueryParams } from '@/types/lib';
import { definePropertyIfAbsent } from '@/utils/object';

declare global {
  interface URL {
    setParam(key: string, value: unknown, removeIfEmpty?: boolean): URL;
    getParam(key: string): string | null;
    getParam<T>(key: string, func: (key: string) => T): Nullable<T>;
    getNumberParam(key: string): Nullable<number>;
    hasParam(key: string, value?: string): boolean;
    setParamsFrom(params: Iterable<QueryParam>): URL;
    deleteParam(key: string): URL;
    tryDeleteParam(key: string, value?: string): boolean;
    getParams(keys: string[]): QueryParams;
    setBool(key: string, value: boolean, removeIfFalse?: boolean): URL;
    goto(openInNewTab?: boolean): void;
    setHost(host: string, port?: number): URL;
    setProtocol(protocol: string): URL;
    combine(path: string): URL;
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
function getParam<T>(this: URL, key: string, func?: (key: string) => T): T | null;
function getParam<T>(this: URL, key: string, func?: (key: string) => T): T | string | null {
  const value = this.searchParams.get(key);
  if (func === undefined || value === null) {
    return value;
  } else {
    return func(value);
  }
}

function getNumberParam(this: URL, key: string) {
  return this.getParam(key, v => +v);
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

function getParams(this: URL, keys: string[]) {
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

function goto(this: URL, openInNewTab: boolean = false) {
  URLEx.goto(this, openInNewTab);
};

function setHost(this: URL, host: string, port?: number) {
  this.hostname = host;
  if (port) {
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

function combine(this: URL, path: string) {
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
definePropertyIfAbsent(URL.prototype, 'combine', combine);
