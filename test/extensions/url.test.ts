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

describe("URL.prototype.deleteParam and tryDeleteParam", () => {
  it("deletes a parameter and returns the same instance", () => {
    const url = new URL("https://example.com/?a=1");

    expect(url.deleteParam("a")).toBe(url);
    expect(url.searchParams.has("a")).toBe(false);
  });

  it("deletes a parameter only when the effective value matches", () => {
    const url = new URL("https://example.com/?a=1&a=2");

    expect(url.tryDeleteParam("a", "1")).toBe(false);
    expect(url.searchParams.getAll("a")).toEqual(["1", "2"]);

    expect(url.tryDeleteParam("a", "2")).toBe(true);
    expect(url.searchParams.has("a")).toBe(false);
  });

  it("deletes a parameter when only the key is checked", () => {
    const url = new URL("https://example.com/?a=1");

    expect(url.tryDeleteParam("a")).toBe(true);
    expect(url.searchParams.has("a")).toBe(false);
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
