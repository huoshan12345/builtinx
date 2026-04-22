import type { Extractor } from "@/types/lib";

describe("RegExpExecArray.prototype.replaceMatch", () => {
  it("replaces the matched substring in the original input", () => {
    const match = /ab/.find("xxabyy");

    expect(match).not.toBeNull();
    expect(match!.replaceMatch("CD")).toBe("xxCDyy");
  });

  it("inserts replacement text for zero-length matches", () => {
    const match = /(?=b)/.find("ab");

    expect(match).not.toBeNull();
    expect(match!.replaceMatch("X")).toBe("aXb");
  });
});

describe("Array.prototype.rewrite", () => {
  it("returns normalized input when rule array is empty", () => {
    expect(([] as RegExp[]).rewrite("hello", "x")).toBe("hello");
    expect(([] as RegExp[]).rewrite(null, "x")).toBe("");
  });

  it("rewrites using regular expressions and a shared replacement", () => {
    expect([/cat/, /dog/].rewrite("cat and dog", "pet")).toBe("pet and pet");
  });

  it("defaults replacement text to an empty string for regular-expression rules", () => {
    expect([/ab/].rewrite("zabz")).toBe("zz");
  });

  it("treats nullish input as an empty string", () => {
    expect([/a/].rewrite(undefined, "x")).toBe("");
  });

  it("restarts from the first extractor after each successful rewrite", () => {
    const extractors: Extractor<string>[] = [
      [/cat/, () => "dog"],
      [/dog/, () => "pet"],
    ];

    expect(extractors.rewrite("cat")).toBe("pet");
  });

  it("uses the first matching extractor in the current pass", () => {
    const extractors: Extractor<string>[] = [
      [/hello/, () => "hi"],
      [/hi/, () => "hey"],
    ];

    expect(extractors.rewrite("hello")).toBe("hey");
  });

  it("supports extractor replacements based on capture groups", () => {
    const extractors: Extractor<string>[] = [
      [/Hello, (\w+)!/, match => `Hi, ${match[1]}!`],
    ];

    expect(extractors.rewrite("Hello, Alice!")).toBe("Hi, Alice!");
  });

  it("preserves zero-length matches when replacement does not change the input", () => {
    expect([/^/].rewrite("abc", "")).toBe("abc");
  });

  it("leaves global regular expressions with lastIndex reset", () => {
    const regex = /ab/g;

    expect([regex].rewrite("xxabyy", "CD")).toBe("xxCDyy");
    expect(regex.lastIndex).toBe(0);
  });
});

describe("Array.prototype.extract", () => {
  it("returns the transformed value from the first matching extractor", () => {
    const extractors: Extractor<number>[] = [
      [/\d+/, match => Number(match[0])],
      [/cat/, () => 0],
    ];

    expect(extractors.extract("id=42")).toBe(42);
  });

  it("checks extractors in order", () => {
    const first = vi.fn(() => "first");
    const second = vi.fn(() => "second");
    const extractors: Extractor<string>[] = [
      [/value/, first],
      [/value/, second],
    ];

    expect(extractors.extract("value")).toBe("first");
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
  });

  it("returns null when no extractor matches", () => {
    const extractors: Extractor<string>[] = [
      [/cat/, () => "cat"],
    ];

    expect(extractors.extract("dog")).toBeNull();
  });

  it("returns null for nullish input", () => {
    const extractors: Extractor<string>[] = [
      [/.*/, () => "value"],
    ];

    expect(extractors.extract(null)).toBeNull();
    expect(extractors.extract(undefined)).toBeNull();
  });

  it("returns null for empty string input", () => {
    const extractors: Extractor<string>[] = [
      [/.*/, () => "value"],
    ];

    expect(extractors.extract("")).toBeNull();
  });

  it("returns null for an empty extractor array", () => {
    expect(([] as Extractor<string>[]).extract("value")).toBeNull();
  });
});

describe("Array.prototype.matchesAny", () => {
  it("should return true when a string pattern matches", () => {
    expect(["cat", "dog"].matchesAny("my dog is here")).toBe(true);
  });

  it("should return true when a RegExp pattern matches", () => {
    expect([/dog/i, /cat/i].matchesAny("My DOG is here")).toBe(true);
  });

  it("should return true when later pattern matches", () => {
    expect(["zzz", "apple"].matchesAny("green apple")).toBe(true);
  });

  it("should return false when no pattern matches", () => {
    expect(["cat", /dog/].matchesAny("bird")).toBe(false);
  });

  it("should return false for empty pattern array", () => {
    expect([].matchesAny("anything")).toBe(false);
  });

  it("should return true for exact string match", () => {
    expect(["hello"].matchesAny("hello")).toBe(true);
  });

  it("should return false for empty input when nothing matches", () => {
    expect(["abc", /def/].matchesAny("")).toBe(false);
  });

  it("should return true when empty string pattern is included", () => {
    expect([""].matchesAny("text")).toBe(true);
  });

  it("should return true when RegExp matches empty input", () => {
    expect([/^$/].matchesAny("")).toBe(true);
  });

  it("should support mixed string and RegExp patterns", () => {
    expect(["cat", /\d+/].matchesAny("item 123")).toBe(true);
  });
});