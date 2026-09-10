import type { Nullable, QueryParam, QueryParams, URLLike } from '../types/lib.js';
import { definePropertyIfAbsent } from '../helpers/utils.js';

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
     * Omitting `value`, or passing null or undefined, checks only key existence.
     * Other values are converted using `String(value)` and compared with the last
     * value for the key. Pass an empty string to check for an empty last value.
     */
    hasParam(key: string, value?: unknown): boolean;

    /**
     * Sets query parameters from another iterable source using `set` semantics.
     */
    setParamsFrom(params: Iterable<QueryParam>): URL;

    /**
     * Deletes a query parameter and returns the URL.
     *
     * Omitting `value`, or passing null or undefined, deletes all entries for the key.
     * Other values are converted using `String(value)` and only matching entries
     * are deleted. Pass an empty string to delete only empty values.
     */
    deleteParam(key: string, value?: unknown): URL;

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

    /**
     * Returns an independent copy of this URL.
     *
     * The optional callback can modify the copy before it is returned.
     */
    clone(func?: (url: URL) => void): URL;

    /**
     * Returns whether this URL has no query parameters.
     */
    hasNoParams(): boolean;

    /**
     * Returns whether this URL has at least one query parameter.
     */
    hasParams(): boolean;

    /**
     * Deletes a query parameter when it exists.
     *
     * Omitting `value`, or passing null or undefined, deletes all entries for the key.
     * Other values are converted using `String(value)` and only matching entries
     * are deleted. Pass an empty string to delete only empty values.
     * Returns true when any entries were deleted, or false when nothing matched.
     */
    tryDeleteParam(key: string, value?: unknown): boolean;

    /**
     * Sets a query parameter only when the key does not already exist.
     *
     * Converts the value using `String.from`: nullish values are stored as empty strings.
     * Returns true when a value is written, or false when the key already exists.
     * Existing values, including empty strings and duplicates, are preserved;
     * the supplied value is not converted when the key already exists.
     */
    trySetParam(key: string, value: unknown): boolean;

    /**
     * Without a base, returns this URL's pathname, search and hash.
     * With a base, returns a reference to this URL relative to that base.
     * String bases, including an empty string, are resolved against this URL first.
     * Returns this URL's absolute href when a path-relative reference cannot preserve it.
     * @example
     * new URL('https://example.com/a/b/file').relative('https://example.com/a/'); // 'b/file'
     */
    relative(base?: URLLike): string;
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

function hasParam(this: URL, key: string, value?: unknown) {
  return value == undefined
    ? this.searchParams.has(key)
    : this.searchParams.hasEffectiveValue(key, value);
};

function setParamsFrom(this: URL, params: Iterable<QueryParam>) {
  this.searchParams.setFrom(params);
  return this;
};

function deleteParam(this: URL, key: string, value?: unknown) {
  const v = value == null ? undefined : String(value);
  this.searchParams.delete(key, v);
  return this;
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

function clone(this: URL, func?: (url: URL) => void): URL {
  const cloned = new URL(this.href);
  if (func) {
    func(cloned);
  }
  return cloned;
}

function hasNoParams(this: URL): boolean {
  return this.searchParams.isEmpty();
}

function hasParams(this: URL): boolean {
  return this.searchParams.isNotEmpty();
}

function tryDeleteParam(this: URL, key: string, value?: unknown): boolean {
  return this.searchParams.tryDelete(key, value);
}

function trySetParam(this: URL, key: string, value: unknown): boolean {
  return this.searchParams.trySet(key, value);
};

function relative(this: URL, base?: URLLike): string {
  return base === undefined
    ? this.pathname + this.search + this.hash
    : getRelativeUrl(new URL(base, this), this);

  function getRelativeUrl(fromUrl: URL, toUrl: URL): string {
    if (
      fromUrl.protocol !== toUrl.protocol ||
      fromUrl.host !== toUrl.host ||
      fromUrl.username !== toUrl.username ||
      fromUrl.password !== toUrl.password ||
      !fromUrl.pathname.startsWith('/') ||
      !toUrl.pathname.startsWith('/')
    ) {
      return toUrl.href;
    }

    // Keep empty segments: repeated and trailing slashes are part of the URL path.
    const fromParts = fromUrl.pathname.split('/');
    const toParts = toUrl.pathname.split('/');
    fromParts.pop();

    // The target's last segment must remain, even when it matches a base directory.
    let commonLength = 0;
    while (
      commonLength < fromParts.length &&
      commonLength < toParts.length - 1 &&
      fromParts[commonLength] === toParts[commonLength]
    ) {
      commonLength++;
    }

    let relativePath = [
      ...Array(fromParts.length - commonLength).fill('..'),
      ...toParts.slice(commonLength),
    ].join('/');

    // Avoid an empty reference, an absolute path, or a first segment parsed as a scheme.
    if (!relativePath || relativePath.startsWith('/') || /^[^/]*:/.test(relativePath)) {
      relativePath = './' + relativePath;
    }

    // Unlike search/hash getters, the serialized suffix preserves empty '?' and '#'.
    const suffixIndex = toUrl.href.search(/[?#]/);
    const suffix = suffixIndex < 0 ? '' : toUrl.href.slice(suffixIndex);
    const reference = relativePath + suffix;

    try {
      return new URL(reference, fromUrl).href === toUrl.href ? reference : toUrl.href;
    } catch {
      // Opaque paths and protocol-specific rules may prevent relative resolution.
      return toUrl.href;
    }
  }
};

definePropertyIfAbsent(URL.prototype, 'setParam', setParam);
definePropertyIfAbsent(URL.prototype, 'getParam', getParam);
definePropertyIfAbsent(URL.prototype, 'getNumberParam', getNumberParam);
definePropertyIfAbsent(URL.prototype, 'hasParam', hasParam);
definePropertyIfAbsent(URL.prototype, 'setParamsFrom', setParamsFrom);
definePropertyIfAbsent(URL.prototype, 'deleteParam', deleteParam);
definePropertyIfAbsent(URL.prototype, 'getParams', getParams);
definePropertyIfAbsent(URL.prototype, 'setBool', setBool);
definePropertyIfAbsent(URL.prototype, 'goto', goto);
definePropertyIfAbsent(URL.prototype, 'setHost', setHost);
definePropertyIfAbsent(URL.prototype, 'setProtocol', setProtocol);
definePropertyIfAbsent(URL.prototype, 'resolve', resolve);
definePropertyIfAbsent(URL.prototype, 'clone', clone);
definePropertyIfAbsent(URL.prototype, 'hasNoParams', hasNoParams);
definePropertyIfAbsent(URL.prototype, 'hasParams', hasParams);
definePropertyIfAbsent(URL.prototype, 'tryDeleteParam', tryDeleteParam);
definePropertyIfAbsent(URL.prototype, 'trySetParam', trySetParam);
definePropertyIfAbsent(URL.prototype, 'relative', relative);
