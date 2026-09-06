import type { Awaitable, Nullable } from '@/types/lib';
import { definePropertyIfAbsent } from '@/helpers/utils';
import { TimeSpan } from '@/utils/time-span';

declare global {
  interface Storage {
    /**
     * Stores a cache entry with an expiration time.
     *
     * Nullish values are ignored and are not written to storage.
     * If storage is full, expired cache entries are cleaned up before retrying.
     */
    setCache<T>(key: string, value: T, expiration: TimeSpan): void;

    /**
     * Returns the cached value for the specified key.
     *
     * Returns null when the key is missing, expired, or does not contain a cache entry.
     * Expired cache entries are removed; unrecognized values are left unchanged.
     */
    getCache<T>(key: string): Nullable<T>;

    /**
     * Returns and removes the unexpired cached value for the specified key.
     *
     * Returns null when the key is missing, expired, or does not contain a cache entry.
     * Expired cache entries are removed; unrecognized values are left unchanged.
     */
    takeCache<T>(key: string): Nullable<T>;

    /**
     * Parses and returns the JSON value stored for the specified key.
     *
     * Returns null when the key is missing.
     * @throws {SyntaxError} When the stored value is not valid JSON.
     */
    getJsonValue<T>(key: string): Nullable<T>;

    /**
     * Returns the cached value for the specified key, or creates and stores one when absent.
     *
     * The factory is only called when the current cache entry is missing, expired, or unrecognized.
     * Nullish factory results are returned to the caller but are not stored.
     */
    getOrCreateCacheAsync<T>(key: string, factory: (key: string) => Awaitable<T>, expiration: TimeSpan): Promise<T>;

    /**
     * Removes expired cache entries and leaves unrecognized values unchanged.
     */
    cleanupExpired(): void;

    /**
     * Returns an iterator over the current storage keys.
     */
    keys(): Iterable<string>;
  }
}

function parseEntry(str: string): Nullable<{ value: unknown; expire: number }> {
  try {
    const obj = JSON.parse(str);
    if (typeof obj.expire !== "number") {
      return null;
    }
    return obj;
  } catch {
    return null;
  }
}

/** Removes expired cache entries while preserving unrecognized stored values. */
export function cleanupExpired(storage: Storage): void {
  const now = Date.now();
  const keysToRemove: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key)
      continue;

    const str = storage.getItem(key);
    if (!str)
      continue;

    const entry = parseEntry(str);
    if (!entry) {
      continue;
    }

    const expire = entry.expire;
    if (expire < now) {
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    storage.removeItem(key);
  }
};

/** Stores a non-nullish cache value with an expiration, cleaning up and retrying on write failure. */
export function setCache<T>(storage: Storage, key: string, value: T, expiration: TimeSpan): void {
  if (!key || value == null)
    return;

  const expireTime = Date.now() + expiration.totalMilliseconds;
  const obj = {
    value: value,
    expire: expireTime,
  };

  const json = JSON.stringify(obj);
  try {
    storage.setItem(key, json);
  } catch (e) {
    cleanupExpired(storage);
    storage.setItem(key, json);
  }
};

/** Returns a live cache value, or null for missing, expired, or unrecognized entries. */
export function getCache<T>(storage: Storage, key: string): Nullable<T> {
  const str = storage.getItem(key);
  if (!str)
    return null;

  const entry = parseEntry(str);
  if (!entry) {
    return null;
  }

  const expire = entry.expire;
  if (expire < Date.now()) {
    storage.removeItem(key);
    return null;
  }
  return entry.value as T;
};

/** Returns and removes a live cache value, or null when no live cache value exists. */
export function takeCache<T>(storage: Storage, key: string): Nullable<T> {
  const value = getCache<T>(storage, key);
  if (value != null) {
    storage.removeItem(key);
  }
  return value;
}

/** Parses a stored JSON value, returning null when absent and throwing for invalid JSON. */
export function getJsonValue<T>(storage: Storage, key: string): Nullable<T> {
  const value = storage.getItem(key);
  return value === null ? null : JSON.parse(value) as T;
}

/** Gets a live cache value or invokes the factory and caches its non-nullish result. */
export async function getOrCreateCacheAsync<T>(
  storage: Storage,
  key: string,
  factory: (key: string) => Awaitable<T>,
  expiration: TimeSpan,
): Promise<T> {
  let obj = getCache<T>(storage, key);
  if (obj == null) {
    obj = await factory(key);
    setCache(storage, key, obj, expiration);
  }
  return obj;
};

/** Iterates the current storage keys. */
export function* keys(storage: Storage): Iterable<string> {
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      yield key;
    }
  }
}

definePropertyIfAbsent(Storage.prototype, 'cleanupExpired', function (this: Storage): void {
  cleanupExpired(this);
});

definePropertyIfAbsent(Storage.prototype, 'setCache', function <T>(
  this: Storage,
  key: string,
  value: T,
  expiration: TimeSpan,
): void {
  setCache(this, key, value, expiration);
});

definePropertyIfAbsent(Storage.prototype, 'getCache', function <T>(this: Storage, key: string): Nullable<T> {
  return getCache<T>(this, key);
});

definePropertyIfAbsent(Storage.prototype, 'takeCache', function <T>(this: Storage, key: string): Nullable<T> {
  return takeCache<T>(this, key);
});

definePropertyIfAbsent(Storage.prototype, 'getJsonValue', function <T>(this: Storage, key: string): Nullable<T> {
  return getJsonValue<T>(this, key);
});

definePropertyIfAbsent(Storage.prototype, 'getOrCreateCacheAsync', function <T>(
  this: Storage,
  key: string,
  factory: (key: string) => Awaitable<T>,
  expiration: TimeSpan,
): Promise<T> {
  return getOrCreateCacheAsync(this, key, factory, expiration);
});

definePropertyIfAbsent(Storage.prototype, 'keys', function (this: Storage): Iterable<string> {
  return keys(this);
});
