import type { Awaitable, Nullable } from '@/types/lib';
import { definePropertyIfAbsent } from '@/utils/object';
import { TimeSpan } from '@/utils/time-span';

declare global {
  interface Storage {
    /**
     * Stores a cache entry with an expiration time.
     *
     * Nullish values are ignored and are not written to storage.
     * Existing values may be evicted if storage is full.
     */
    setCache<T>(key: string, value: T, expiration: TimeSpan): void;

    /**
     * Returns the cached value for the specified key.
     *
     * Returns null when the key is missing, expired, or contains invalid cache data.
     * Expired and invalid entries are removed from storage.
     */
    getCache<T>(key: string): Nullable<T>;

    /**
     * Returns the cached value for the specified key, or creates and stores one when absent.
     *
     * The factory is only called when the current cache entry is missing, expired, or invalid.
     * Nullish factory results are returned to the caller but are not stored.
     */
    getOrCreateCacheAsync<T>(key: string, factory: (key: string) => Awaitable<T>, expiration: TimeSpan): Promise<T>;

    /**
     * Removes expired and invalid cache entries.
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
      keysToRemove.push(key);
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
  for (let i = 0; i < 10; i++) {
    try {
      this.setItem(key, json);
      break;
    } catch (e) {
      if (e instanceof DOMException) {

        if (i === 0) {
          this.cleanupExpired(); // first try to cleanup expired items
          continue;
        }

        const k = this.key(0);
        if (k) {
          this.removeItem(k);          
          continue;
        }
      }
      throw e;
    }
  }
};

function getCache<T>(this: Storage, key: string): Nullable<T> {
  const str = this.getItem(key);
  if (!str)
    return null;

  const entry = parseEntry(str);
  if (!entry) {
    this.removeItem(key);
    return null;
  }

  const expire = entry.expire;
  if (expire < Date.now()) {
    this.removeItem(key);
    return null;
  }
  return entry.value as T;
};

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
definePropertyIfAbsent(Storage.prototype, 'getOrCreateCacheAsync', getOrCreateCacheAsync);
definePropertyIfAbsent(Storage.prototype, 'keys', keys);
