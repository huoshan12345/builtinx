describe("String.prototype.contains", () => {
  it("returns true when substring exists", () => {
    expect("hello world".contains("world")).toBe(true);
  });

  it("returns false when substring does not exist", () => {
    expect("hello world".contains("mars")).toBe(false);
  });

  it("returns true for empty string pattern", () => {
    expect("hello".contains("")).toBe(true);
  });

  it("returns true when regular expression matches", () => {
    expect("hello world".contains(/wo.ld/)).toBe(true);
  });

  it("returns false when regular expression does not match", () => {
    expect("hello world".contains(/mars/)).toBe(false);
  });

  it("resets lastIndex when regular expression is global", () => {
    const regex = /wo.ld/g;
    regex.lastIndex = 999;

    expect("hello world".contains(regex)).toBe(true);
    expect(regex.lastIndex).toBe(0);
  });
});

describe("String.prototype.matches", () => {
  it("returns true for exact string equality", () => {
    expect("hello".matches("hello")).toBe(true);
  });

  it("returns false for different strings", () => {
    expect("hello".matches("Hello")).toBe(false);
  });

  it("returns true when regular expression finds a match", () => {
    expect("hello".matches(/ell/)).toBe(true);
  });

  it("returns false when regular expression does not match", () => {
    expect("hello".matches(/xyz/)).toBe(false);
  });

  it("resets lastIndex when regular expression is global", () => {
    const regex = /ell/g;
    regex.lastIndex = 123;

    expect("hello".matches(regex)).toBe(true);
    expect(regex.lastIndex).toBe(0);
  });
});

describe("String.prototype.skipUntil", () => {
  it("returns substring after first separator by default", () => {
    expect("foo/bar/baz".skipUntil("/")).toBe("bar/baz");
  });

  it("keeps separator when skipSeparator is false", () => {
    expect("foo/bar/baz".skipUntil("/", false)).toBe("/bar/baz");
  });

  it("uses last separator when untilLast is true", () => {
    expect("foo/bar/baz".skipUntil("/", true, true)).toBe("baz");
  });

  it("returns original string when separator is not found", () => {
    expect("foobar".skipUntil("/")).toBe("foobar");
  });

  it("returns original string for empty separator by default", () => {
    expect("foobar".skipUntil("")).toBe("foobar");
  });

  it("returns empty string for empty separator when using the last occurrence", () => {
    expect("foobar".skipUntil("", true, true)).toBe("");
  });
});

describe("String.prototype.takeUntil", () => {
  it("returns substring through first separator by default", () => {
    expect("foo/bar/baz".takeUntil("/")).toBe("foo/");
  });

  it("excludes separator when includeSeparator is false", () => {
    expect("foo/bar/baz".takeUntil("/", false)).toBe("foo");
  });

  it("uses last separator when untilLast is true", () => {
    expect("foo/bar/baz".takeUntil("/", true, true)).toBe("foo/bar/");
  });

  it("returns original string when separator is not found", () => {
    expect("foobar".takeUntil("/")).toBe("foobar");
  });

  it("returns empty string for empty separator by default", () => {
    expect("foobar".takeUntil("")).toBe("");
  });

  it("returns original string for empty separator when using the last occurrence", () => {
    expect("foobar".takeUntil("", true, true)).toBe("foobar");
  });
});

describe("String.prototype.ifEmpty", () => {
  it("returns fallback for empty string", () => {
    expect("".ifEmpty("fallback")).toBe("fallback");
  });

  it("returns original string when non-empty", () => {
    expect("value".ifEmpty("fallback")).toBe("value");
  });

  it("does not treat whitespace-only strings as empty", () => {
    expect(" ".ifEmpty("fallback")).toBe(" ");
  });
});

describe("String.prototype.parseFloat", () => {
  it("parses a floating-point number from the start of the string", () => {
    expect("12.5px".parseFloat()).toBe(12.5);
  });

  it("supports exponent notation", () => {
    expect("1.25e2".parseFloat()).toBe(125);
  });

  it("returns NaN when the string does not start with a number", () => {
    expect("abc".parseFloat()).toBeNaN();
  });

  it("ignores leading whitespace", () => {
    expect("  3.5rem".parseFloat()).toBe(3.5);
  });
});

describe("String.prototype.parseInt", () => {
  it("parses an integer from the start of the string", () => {
    expect("42px".parseInt()).toBe(42);
  });

  it("supports an explicit radix", () => {
    expect("ff".parseInt(16)).toBe(255);
  });

  it("returns NaN when the string does not start with a number", () => {
    expect("abc".parseInt()).toBeNaN();
  });

  it("ignores leading whitespace", () => {
    expect("  15".parseInt()).toBe(15);
  });
});

describe("String.prototype.toRegExp", () => {
  it("creates a regular expression with flags", () => {
    const regex = "hello".toRegExp("gi");

    expect(regex).toBeInstanceOf(RegExp);
    expect(regex.source).toBe("hello");
    expect(regex.flags).toBe("gi");
  });

  it("throws for invalid regular expression patterns", () => {
    expect(() => "[".toRegExp()).toThrow(SyntaxError);
  });
});

describe("String.prototype.parenthesize", () => {
  it("wraps a string in parentheses", () => {
    expect("hello".parenthesize()).toBe("(hello)");
  });

  it("handles empty strings", () => {
    expect("".parenthesize()).toBe("()");
  });
});

describe("String.prototype.unescapeHtml", () => {
  it("decodes named HTML entities", () => {
    expect("&lt;div&gt;&amp;&lt;/div&gt;".unescapeHtml()).toBe("<div>&</div>");
  });

  it("decodes numeric HTML entities", () => {
    expect("&#72;&#x69;".unescapeHtml()).toBe("Hi");
  });

  it("preserves literal markup", () => {
    expect("<strong>hello</strong>".unescapeHtml()).toBe("<strong>hello</strong>");
  });

  it("decodes entities only once", () => {
    expect("&amp;lt;".unescapeHtml()).toBe("&lt;");
  });
});

describe("String.prototype.equalsIgnoreAsciiCase", () => {
  it("returns true for ASCII strings that differ only by case", () => {
    expect("Hello".equalsIgnoreAsciiCase("hELLo")).toBe(true);
  });

  it("returns false for null", () => {
    expect("hello".equalsIgnoreAsciiCase(null)).toBe(false);
  });

  it("returns false for different lengths", () => {
    expect("hello".equalsIgnoreAsciiCase("hell")).toBe(false);
  });

  it("returns true for identical non-ASCII strings", () => {
    expect("你好😊".equalsIgnoreAsciiCase("你好😊")).toBe(true);
  });

  it("does not fold non-ASCII case differences", () => {
    expect("Ä".equalsIgnoreAsciiCase("ä")).toBe(false);
  });

  it("handles astral symbols without splitting surrogate pairs", () => {
    expect("A😊Z".equalsIgnoreAsciiCase("a😊z")).toBe(true);
  });
});

describe("String.prototype.trimChars", () => {
  it("trims ASCII characters from both ends", () => {
    expect("--hello--".trimChars("-")).toBe("hello");
  });

  it("returns original string when nothing is trimmed", () => {
    expect("hello".trimChars("-")).toBe("hello");
  });

  it("returns original string when trim set is empty", () => {
    expect("hello".trimChars("")).toBe("hello");
  });

  it("returns original string when source string is empty", () => {
    expect("".trimChars("-")).toBe("");
  });

  it("trims Unicode code points from both ends", () => {
    expect("😊hello😊".trimChars("😊")).toBe("hello");
  });

  it("supports multiple Unicode code points in the trim set", () => {
    expect("😊🚀hello🚀😊".trimChars("🚀😊")).toBe("hello");
  });

  it("does not trim matching code points from the middle", () => {
    expect("a😊b".trimChars("😊")).toBe("a😊b");
  });

  it("returns empty string when all code points are trimmed", () => {
    expect("😊🚀😊".trimChars("🚀😊")).toBe("");
  });
});
