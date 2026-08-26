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

function cleanupExpired(this: Storage): void {
  const now = Date.now();
  const keysToRemove: string[] = [];
  for (let i = 0; i < this.length; i++) {
    const key = this.key(i);
    if (!key)
      continue;

    const str = this.getItem(key);
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
    this.removeItem(key);
  }
};

function setCache<T>(this: Storage, key: string, value: T, expiration: TimeSpan): void {
  if (!key || value == null)
    return;

  const expireTime = Date.now() + expiration.totalMilliseconds;
  const obj = {
    value: value,
    expire: expireTime,
  };

  const json = JSON.stringify(obj);
  try {
    this.setItem(key, json);
  } catch (e) {
    this.cleanupExpired();
    this.setItem(key, json);
  }
};

function getCache<T>(this: Storage, key: string): Nullable<T> {
  const str = this.getItem(key);
  if (!str)
    return null;

  const entry = parseEntry(str);
  if (!entry) {
    return null;
  }

  const expire = entry.expire;
  if (expire < Date.now()) {
    this.removeItem(key);
    return null;
  }
  return entry.value as T;
};

function takeCache<T>(this: Storage, key: string): Nullable<T> {
  const value = this.getCache<T>(key);
  if (value != null) {
    this.removeItem(key);
  }
  return value;
}

async function getOrCreateCacheAsync<T>(this: Storage, key: string, factory: (key: string) => Awaitable<T>, expiration: TimeSpan) {
  let obj = this.getCache<T>(key);
  if (obj == null) {
    obj = await factory(key);
    this.setCache(key, obj, expiration);
  }
  return obj;
};

function* keys(this: Storage): Iterable<string> {
  for (let i = 0; i < this.length; i++) {
    const key = this.key(i);
    if (key) {
      yield key;
    }
  }
}

definePropertyIfAbsent(Storage.prototype, 'cleanupExpired', cleanupExpired);
definePropertyIfAbsent(Storage.prototype, 'setCache', setCache);
definePropertyIfAbsent(Storage.prototype, 'getCache', getCache);
definePropertyIfAbsent(Storage.prototype, 'takeCache', takeCache);
definePropertyIfAbsent(Storage.prototype, 'getOrCreateCacheAsync', getOrCreateCacheAsync);
definePropertyIfAbsent(Storage.prototype, 'keys', keys);
