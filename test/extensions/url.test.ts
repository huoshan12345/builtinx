describe("URL.prototype.setParam", () => {
  it("sets a string query parameter", () => {
    const url = new URL("https://example.com");

    url.setParam("a", "1");

    expect(url.searchParams.get("a")).toBe("1");
  });

  it("converts non-string values using toString", () => {
    const url = new URL("https://example.com");

    url.setParam("a", 123).setParam("b", false);

    expect(url.searchParams.get("a")).toBe("123");
    expect(url.searchParams.get("b")).toBe("false");
  });

  it("removes the key for nullish values by default", () => {
    const url = new URL("https://example.com?a=1");

    url.setParam("a", null);

    expect(url.searchParams.has("a")).toBe(false);
  });

  it("keeps an empty string when removeIfEmpty is false", () => {
    const url = new URL("https://example.com");

    url.setParam("a", "", false);

    expect(url.searchParams.get("a")).toBe("");
  });

  it("returns the same instance", () => {
    const url = new URL("https://example.com");

    expect(url.setParam("a", "1")).toBe(url);
  });
});

describe("URL.prototype.getParam", () => {
  it("returns the last value of a parameter", () => {
    const url = new URL("https://example.com/?a=1&a=2");

    expect(url.getParam("a")).toBe("2");
  });

  it("returns null when the key is missing", () => {
    const url = new URL("https://example.com");

    expect(url.getParam("a")).toBeNull();
  });

  it("transforms the value when a transform is provided", () => {
    const url = new URL("https://example.com/?a=2");

    expect(url.getParam("a", value => Number(value) * 2)).toBe(4);
  });

  it("does not call the transform when the key is missing", () => {
    const url = new URL("https://example.com");
    const transform = vi.fn((value: string) => value);

    expect(url.getParam("a", transform)).toBeNull();
    expect(transform).not.toHaveBeenCalled();
  });
});

describe("URL.prototype.getNumberParam", () => {
  it("returns a numeric parameter value", () => {
    const url = new URL("https://example.com/?page=42");

    expect(url.getNumberParam("page")).toBe(42);
  });

  it("returns null for missing values", () => {
    const url = new URL("https://example.com");

    expect(url.getNumberParam("page")).toBeNull();
  });

  it("returns null for invalid numeric values", () => {
    const url = new URL("https://example.com/?page=abc");

    expect(url.getNumberParam("page")).toBeNull();
  });
});

describe("URL.prototype.hasParam", () => {
  it("checks key existence when the value is explicitly null or undefined", () => {
    const url = new URL("https://example.com/?a=1");

    expect(url.hasParam("a", null)).toBe(true);
    expect(url.hasParam("a", undefined)).toBe(true);
    expect(url.hasParam("missing", null)).toBe(false);
    expect(url.hasParam("missing", undefined)).toBe(false);
  });

  it("compares the effective value when an empty string is supplied", () => {
    const url = new URL("https://example.com/?a=&a=1&b=1&b=");

    expect(url.hasParam("a", "")).toBe(false);
    expect(url.hasParam("b", "")).toBe(true);
    expect(url.hasParam("missing", "")).toBe(false);
  });

  it("checks for key existence", () => {
    const url = new URL("https://example.com/?a=1");

    expect(url.hasParam("a")).toBe(true);
    expect(url.hasParam("b")).toBe(false);
  });

  it("checks the effective last value when a value is provided", () => {
    const url = new URL("https://example.com/?a=1&a=2");

    expect(url.hasParam("a", "2")).toBe(true);
    expect(url.hasParam("a", "1")).toBe(false);
  });
});

describe("URL.prototype.setParamsFrom", () => {
  it("sets params from an iterable source", () => {
    const url = new URL("https://example.com/?a=1");

    url.setParamsFrom(new Map([["b", "2"]]));

    expect(url.searchParams.get("a")).toBe("1");
    expect(url.searchParams.get("b")).toBe("2");
  });

  it("returns the same instance", () => {
    const url = new URL("https://example.com");

    expect(url.setParamsFrom([["a", "1"]])).toBe(url);
  });
});

describe("URL.prototype.deleteParam", () => {
  it("uses the same object conversion as trySetParam", () => {
    const url = new URL("https://example.com/?b=2");
    const value = { [Symbol.toPrimitive]: () => "custom" };

    expect(url.trySetParam("a", value)).toBe(true);
    expect(url.deleteParam("a", value)).toBe(url);
    expect(url.search).toBe("?b=2");
  });

  it("deletes every value for the key when the filter is explicitly null", () => {
    const url = new URL("https://example.com/?a=&a=1&b=2");

    expect(url.deleteParam("a", null)).toBe(url);
    expect(url.search).toBe("?b=2");
  });

  it("deletes every value for the key when value is explicitly undefined", () => {
    const url = new URL("https://example.com/?a=1&a=&a=2&b=3");

    expect(url.deleteParam("a", undefined)).toBe(url);
    expect(url.search).toBe("?b=3");
  });

  it("deletes only empty values when an empty string is supplied", () => {
    const url = new URL("https://example.com/?a=1&a=&a=2");

    url.deleteParam("a", "");

    expect(url.searchParams.getAll("a")).toEqual(["1", "2"]);
  });

  it("deletes a parameter and returns the same instance", () => {
    const url = new URL("https://example.com/?a=1");

    expect(url.deleteParam("a")).toBe(url);
    expect(url.searchParams.has("a")).toBe(false);
  });

  it("deletes only matching values when a value is provided", () => {
    const url = new URL("https://example.com/?a=1&a=2");

    expect(url.deleteParam("a", "1")).toBe(url);
    expect(url.searchParams.getAll("a")).toEqual(["2"]);
  });
});

describe("URL.prototype.getParams", () => {
  it("returns existing params for the requested keys", () => {
    const url = new URL("https://example.com/?a=1&b=2");

    expect(url.getParams(["a", "c", "b"])).toEqual([
      ["a", "1"],
      ["b", "2"],
    ]);
  });

  it("accepts generic iterables of keys", () => {
    const url = new URL("https://example.com/?a=1&b=2");

    expect(url.getParams(new Set(["b", "a"]))).toEqual([
      ["b", "2"],
      ["a", "1"],
    ]);
  });
});

describe("URL.prototype.setBool", () => {
  it("sets a true boolean query param", () => {
    const url = new URL("https://example.com");

    url.setBool("enabled", true);

    expect(url.searchParams.get("enabled")).toBe("true");
  });

  it("removes false values by default", () => {
    const url = new URL("https://example.com/?enabled=true");

    url.setBool("enabled", false);

    expect(url.searchParams.has("enabled")).toBe(false);
  });

  it("returns the same instance", () => {
    const url = new URL("https://example.com");

    expect(url.setBool("enabled", true)).toBe(url);
  });
});

describe("URL.prototype.goto", () => {
  it("forwards navigation to URLEx.goto", () => {
    const url = new URL("https://example.com/next");
    const spy = vi.spyOn(URLEx, "goto").mockImplementation(() => { });

    url.goto(true, true);

    expect(spy).toHaveBeenCalledWith(url, true, true);
  });
});

describe("URL.prototype.setHost", () => {
  it("updates the hostname", () => {
    const url = new URL("https://example.com:8080/path");

    url.setHost("api.example.com");

    expect(url.hostname).toBe("api.example.com");
    expect(url.port).toBe("8080");
  });

  it("updates the port when provided", () => {
    const url = new URL("https://example.com/path");

    url.setHost("api.example.com", 3000);

    expect(url.hostname).toBe("api.example.com");
    expect(url.port).toBe("3000");
  });

  it("returns the same instance", () => {
    const url = new URL("https://example.com");

    expect(url.setHost("api.example.com")).toBe(url);
  });
});

describe("URL.prototype.setProtocol", () => {
  it("adds a trailing colon when missing", () => {
    const url = new URL("https://example.com");

    url.setProtocol("http");

    expect(url.protocol).toBe("http:");
  });

  it("keeps the provided protocol when it already has a colon", () => {
    const url = new URL("https://example.com");

    url.setProtocol("http:");

    expect(url.protocol).toBe("http:");
  });

  it("returns the same instance", () => {
    const url = new URL("https://example.com");

    expect(url.setProtocol("http")).toBe(url);
  });
});

describe("URL.prototype.resolve", () => {
  it("resolves a relative path against the current URL", () => {
    const url = new URL("https://example.com/root/child/");

    expect(url.resolve("../next").href).toBe("https://example.com/root/next");
  });

  it("resolves an absolute path against the current origin", () => {
    const url = new URL("https://example.com/root/child/");

    expect(url.resolve("/next").href).toBe("https://example.com/next");
  });

  it("returns the absolute URL unchanged when the path is absolute", () => {
    const url = new URL("https://example.com/root/child/");

    expect(url.resolve("https://other.test/path").href).toBe("https://other.test/path");
  });
});

describe("URL.prototype.clone", () => {
  it("returns an independent copy", () => {
    const url = new URL("https://example.com/path?a=1");

    const cloned = url.clone();
    cloned.setParam("a", "2");

    expect(cloned).not.toBe(url);
    expect(cloned.href).toBe("https://example.com/path?a=2");
    expect(url.href).toBe("https://example.com/path?a=1");
  });

  it("allows the callback to modify the copy before returning it", () => {
    const url = new URL("https://example.com/path?a=1");

    const cloned = url.clone(copy => copy.setParam("a", "2"));

    expect(cloned.href).toBe("https://example.com/path?a=2");
    expect(url.href).toBe("https://example.com/path?a=1");
  });
});

describe("URL.prototype.hasNoParams and hasParams", () => {
  it("identifies URLs without query parameters", () => {
    const url = new URL("https://example.com/path");

    expect(url.hasNoParams()).toBe(true);
    expect(url.hasParams()).toBe(false);
  });

  it("identifies URLs with query parameters", () => {
    const url = new URL("https://example.com/path?a=1");

    expect(url.hasNoParams()).toBe(false);
    expect(url.hasParams()).toBe(true);
  });
});

describe("URL.prototype.tryDeleteParam", () => {
  it("uses the same object conversion as trySetParam", () => {
    const url = new URL("https://example.com/?b=2");
    const value = { [Symbol.toPrimitive]: () => "custom" };

    expect(url.trySetParam("a", value)).toBe(true);
    expect(url.tryDeleteParam("a", value)).toBe(true);
    expect(url.search).toBe("?b=2");
  });

  it("deletes every value for the key when the filter is explicitly null", () => {
    const url = new URL("https://example.com/?a=&a=1&b=2");

    expect(url.tryDeleteParam("a", null)).toBe(true);
    expect(url.search).toBe("?b=2");
    expect(url.tryDeleteParam("a", null)).toBe(false);
  });

  it("deletes duplicate values without a filter and returns false on retry", () => {
    const url = new URL("https://example.com/?a=1&a=&a=2&b=3");

    expect(url.tryDeleteParam("a")).toBe(true);
    expect(url.search).toBe("?b=3");
    expect(url.tryDeleteParam("a")).toBe(false);
  });

  it("accepts unknown values and deletes only their matching entries", () => {
    const url = new URL("https://example.com/?a=0&a=false&a=&a=1");
    const value: unknown = false;

    expect(url.hasParam("a", 1)).toBe(true);
    expect(url.tryDeleteParam("a", value)).toBe(true);
    expect(url.searchParams.getAll("a")).toEqual(["0", "", "1"]);
    expect(url.deleteParam("a", 0)).toBe(url);
    expect(url.searchParams.getAll("a")).toEqual(["", "1"]);
  });

  it("deletes an existing parameter and returns true", () => {
    const url = new URL("https://example.com/path?a=1");

    expect(url.tryDeleteParam("a")).toBe(true);
    expect(url.searchParams.has("a")).toBe(false);
  });

  it("deletes only matching values when a value is provided", () => {
    const url = new URL("https://example.com/path?a=1&a=2");

    expect(url.tryDeleteParam("a", "1")).toBe(true);
    expect(url.searchParams.getAll("a")).toEqual(["2"]);
  });

  it("returns false without changing the URL when no matching parameter exists", () => {
    const url = new URL("https://example.com/path?a=1");

    expect(url.tryDeleteParam("a", "2")).toBe(false);
    expect(url.href).toBe("https://example.com/path?a=1");
  });
});

describe("URL.prototype.trySetParam", () => {
  it.each([
    [42, "42"],
    [false, "false"],
    [null, ""],
    [undefined, ""],
    ["", ""],
  ])("sets %s only once and reports whether it changed the URL", (value, expected) => {
    const url = new URL("https://example.com/?b=1");

    const added: boolean = url.trySetParam("a", value);

    expect(added).toBe(true);
    expect(url.searchParams.get("a")).toBe(expected);
    expect(url.trySetParam("a", "replacement")).toBe(false);
    expect(url.searchParams.get("a")).toBe(expected);
    expect(url.searchParams.get("b")).toBe("1");
  });

  it("does not convert a rejected value or alter duplicate existing values", () => {
    const url = new URL("https://example.com/?a=&a=1");
    const toString = vi.fn(() => "replacement");

    expect(url.trySetParam("a", { toString })).toBe(false);
    expect(toString).not.toHaveBeenCalled();
    expect(url.searchParams.getAll("a")).toEqual(["", "1"]);
  });
});
