import { TimeSpan } from "@/utils/time-span";

describe("Storage.prototype.setCache and getCache", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stores and retrieves a cached value", () => {
    localStorage.setCache("user", { id: 1 }, TimeSpan.fromMinutes(5));

    expect(localStorage.getCache<{ id: number }>("user")).toEqual({ id: 1 });
  });

  it("supports falsy non-null values", () => {
    localStorage.setCache("zero", 0, TimeSpan.fromMinutes(5));
    localStorage.setCache("false", false, TimeSpan.fromMinutes(5));
    localStorage.setCache("empty", "", TimeSpan.fromMinutes(5));

    expect(localStorage.getCache<number>("zero")).toBe(0);
    expect(localStorage.getCache<boolean>("false")).toBe(false);
    expect(localStorage.getCache<string>("empty")).toBe("");
  });

  it("does not store nullish values", () => {
    localStorage.setCache("null", null, TimeSpan.fromMinutes(5));
    localStorage.setCache("undefined", undefined, TimeSpan.fromMinutes(5));

    expect(localStorage.getItem("null")).toBeNull();
    expect(localStorage.getItem("undefined")).toBeNull();
  });

  it("does not store values for empty keys", () => {
    localStorage.setCache("", "value", TimeSpan.fromMinutes(5));

    expect(localStorage.length).toBe(0);
  });

  it("returns null for missing keys", () => {
    expect(localStorage.getCache("missing")).toBeNull();
  });

  it("returns null and removes expired entries", () => {
    localStorage.setCache("token", "abc", TimeSpan.fromMilliseconds(1));
    vi.advanceTimersByTime(2);

    expect(localStorage.getCache("token")).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("returns null without removing non-cache entries", () => {
    localStorage.setItem("bad", "{not json");

    expect(localStorage.getCache("bad")).toBeNull();
    expect(localStorage.getItem("bad")).toBe("{not json");
  });

  it("returns null without removing entries without a numeric expire field", () => {
    localStorage.setItem("bad", JSON.stringify({ value: "x", expire: "tomorrow" }));

    expect(localStorage.getCache("bad")).toBeNull();
    expect(localStorage.getItem("bad")).toBe(JSON.stringify({ value: "x", expire: "tomorrow" }));
  });
});

describe("Storage.prototype.takeCache", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns and removes a cached value", () => {
    localStorage.setCache("token", "abc", TimeSpan.fromMinutes(5));

    expect(localStorage.takeCache<string>("token")).toBe("abc");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("returns and removes falsy cached values", () => {
    localStorage.setCache("zero", 0, TimeSpan.fromMinutes(5));
    localStorage.setCache("false", false, TimeSpan.fromMinutes(5));
    localStorage.setCache("empty", "", TimeSpan.fromMinutes(5));

    expect(localStorage.takeCache<number>("zero")).toBe(0);
    expect(localStorage.takeCache<boolean>("false")).toBe(false);
    expect(localStorage.takeCache<string>("empty")).toBe("");
    expect(localStorage.length).toBe(0);
  });

  it("removes expired entries but preserves unrecognized values", () => {
    localStorage.setCache("expired", "abc", TimeSpan.fromMilliseconds(1));
    localStorage.setItem("foreign", "{not json");
    vi.advanceTimersByTime(2);

    expect(localStorage.takeCache("expired")).toBeNull();
    expect(localStorage.getItem("expired")).toBeNull();
    expect(localStorage.takeCache("foreign")).toBeNull();
    expect(localStorage.getItem("foreign")).toBe("{not json");
  });
});

describe("Storage.prototype.getJsonValue", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns a parsed JSON value", () => {
    localStorage.setItem("settings", JSON.stringify({ theme: "dark" }));

    expect(localStorage.getJsonValue<{ theme: string }>("settings")).toEqual({ theme: "dark" });
  });

  it("returns null when the key is missing", () => {
    expect(localStorage.getJsonValue("missing")).toBeNull();
  });

  it("throws when the stored value is invalid JSON", () => {
    localStorage.setItem("invalid", "not json");

    expect(() => localStorage.getJsonValue("invalid")).toThrow(SyntaxError);
  });
});

describe("Storage.prototype.getOrCreateCacheAsync", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates and stores a value when cache is missing", async () => {
    const factory = vi.fn(async (key: string) => `value:${key}`);

    await expect(
      localStorage.getOrCreateCacheAsync("user", factory, TimeSpan.fromMinutes(5))
    ).resolves.toBe("value:user");

    expect(factory).toHaveBeenCalledTimes(1);
    expect(localStorage.getCache("user")).toBe("value:user");
  });

  it("returns cached value without calling the factory again", async () => {
    localStorage.setCache("count", 0, TimeSpan.fromMinutes(5));
    const factory = vi.fn(async () => 1);

    await expect(
      localStorage.getOrCreateCacheAsync("count", factory, TimeSpan.fromMinutes(5))
    ).resolves.toBe(0);

    expect(factory).not.toHaveBeenCalled();
  });

  it("recreates values when the existing cache entry is expired", async () => {
    localStorage.setCache("session", "old", TimeSpan.fromMilliseconds(1));
    vi.advanceTimersByTime(2);
    const factory = vi.fn(async () => "new");

    await expect(
      localStorage.getOrCreateCacheAsync("session", factory, TimeSpan.fromMinutes(5))
    ).resolves.toBe("new");

    expect(factory).toHaveBeenCalledTimes(1);
    expect(localStorage.getCache("session")).toBe("new");
  });

  it("returns nullish factory results without caching them", async () => {
    const nullFactory = vi.fn(async () => null);
    const undefinedFactory = vi.fn(async () => undefined);

    await expect(
      localStorage.getOrCreateCacheAsync("null", nullFactory, TimeSpan.fromMinutes(5))
    ).resolves.toBeNull();
    await expect(
      localStorage.getOrCreateCacheAsync("undefined", undefinedFactory, TimeSpan.fromMinutes(5))
    ).resolves.toBeUndefined();

    expect(localStorage.getItem("null")).toBeNull();
    expect(localStorage.getItem("undefined")).toBeNull();
  });
});

describe("Storage.prototype.cleanupExpired", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("removes expired entries and preserves valid ones", () => {
    localStorage.setCache("expired", "a", TimeSpan.fromMilliseconds(1));
    localStorage.setCache("valid", "b", TimeSpan.fromMinutes(5));
    vi.advanceTimersByTime(2);

    localStorage.cleanupExpired();

    expect(localStorage.getItem("expired")).toBeNull();
    expect(localStorage.getCache("valid")).toBe("b");
  });

  it("preserves non-cache entries during cleanup", () => {
    localStorage.setItem("bad-json", "{not json");
    localStorage.setItem("bad-shape", JSON.stringify({ value: "x" }));

    localStorage.cleanupExpired();

    expect(localStorage.getItem("bad-json")).toBe("{not json");
    expect(localStorage.getItem("bad-shape")).toBe(JSON.stringify({ value: "x" }));
  });
});

describe("Storage.prototype.keys", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns an iterator over current storage keys", () => {
    localStorage.setItem("a", "1");
    localStorage.setItem("b", "2");

    expect([...localStorage.keys()]).toEqual(["a", "b"]);
  });

  it("returns an empty iterator when storage is empty", () => {
    expect([...localStorage.keys()]).toEqual([]);
  });
});
