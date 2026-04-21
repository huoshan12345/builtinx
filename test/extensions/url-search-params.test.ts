describe("URLSearchParams.prototype.getInt", () => {
  it("returns the parsed integer value", () => {
    const params = new URLSearchParams("page=42");

    expect(params.getInt("page")).toBe(42);
  });

  it("parses using base 10", () => {
    const params = new URLSearchParams("value=08");

    expect(params.getInt("value")).toBe(8);
  });

  it("returns the default value when the key is missing", () => {
    const params = new URLSearchParams();

    expect(params.getInt("page", 7)).toBe(7);
  });

  it("returns the default value when the value is empty", () => {
    const params = new URLSearchParams("page=");

    expect(params.getInt("page", 7)).toBe(7);
  });

  it("returns the default value when the value is not numeric", () => {
    const params = new URLSearchParams("page=abc");

    expect(params.getInt("page", 7)).toBe(7);
  });
});

describe("URLSearchParams.prototype.getBool", () => {
  it("returns true for true ignoring ASCII case", () => {
    const params = new URLSearchParams("enabled=TrUe");

    expect(params.getBool("enabled")).toBe(true);
  });

  it("returns false for non-true values", () => {
    const params = new URLSearchParams("enabled=yes");

    expect(params.getBool("enabled", true)).toBe(false);
  });

  it("returns the default value when the key is missing", () => {
    const params = new URLSearchParams();

    expect(params.getBool("enabled", true)).toBe(true);
  });

  it("returns the default value when the value is empty", () => {
    const params = new URLSearchParams("enabled=");

    expect(params.getBool("enabled", true)).toBe(true);
  });
});

describe("URLSearchParams.prototype.setBool", () => {
  it("writes true as a string", () => {
    const params = new URLSearchParams();

    params.setBool("enabled", true);

    expect(params.get("enabled")).toBe("true");
  });

  it("removes the key when value is false and removeIfFalse is true", () => {
    const params = new URLSearchParams("enabled=true");

    params.setBool("enabled", false);

    expect(params.has("enabled")).toBe(false);
  });

  it("writes false when removeIfFalse is false", () => {
    const params = new URLSearchParams();

    params.setBool("enabled", false, false);

    expect(params.get("enabled")).toBe("false");
  });

  it("returns the same instance", () => {
    const params = new URLSearchParams();

    expect(params.setBool("enabled", true)).toBe(params);
  });
});

describe("URLSearchParams.prototype.any", () => {
  it("returns false for empty params", () => {
    expect(new URLSearchParams().any()).toBe(false);
  });

  it("returns true when at least one key exists", () => {
    expect(new URLSearchParams("a=1").any()).toBe(true);
  });
});

describe("URLSearchParams.prototype.distinct", () => {
  it("keeps only the last value for each key", () => {
    const params = new URLSearchParams("a=1&a=2&b=3&b=4");

    params.distinct();

    expect(params.getAll("a")).toEqual(["2"]);
    expect(params.getAll("b")).toEqual(["4"]);
  });

  it("returns the same instance", () => {
    const params = new URLSearchParams("a=1&a=2");

    expect(params.distinct()).toBe(params);
  });
});

describe("URLSearchParams.prototype.setFrom", () => {
  it("sets values from another URLSearchParams instance", () => {
    const params = new URLSearchParams("a=1");

    params.setFrom(new URLSearchParams("b=2"));

    expect(params.get("a")).toBe("1");
    expect(params.get("b")).toBe("2");
  });

  it("accepts generic iterables of key-value pairs", () => {
    const params = new URLSearchParams();

    params.setFrom(new Map([["a", "1"], ["b", "2"]]));

    expect(params.get("a")).toBe("1");
    expect(params.get("b")).toBe("2");
  });

  it("overwrites duplicate keys using set semantics", () => {
    const params = new URLSearchParams("a=1");

    params.setFrom([["a", "2"], ["a", "3"]]);

    expect(params.getAll("a")).toEqual(["3"]);
  });

  it("returns the same instance", () => {
    const params = new URLSearchParams();

    expect(params.setFrom([["a", "1"]])).toBe(params);
  });
});

describe("URLSearchParams.prototype.hasEffectiveValue", () => {
  it("returns true when the last value matches", () => {
    const params = new URLSearchParams("a=1&a=2");

    expect(params.hasEffectiveValue("a", "2")).toBe(true);
  });

  it("returns false when only an earlier value matches", () => {
    const params = new URLSearchParams("a=1&a=2");

    expect(params.hasEffectiveValue("a", "1")).toBe(false);
  });

  it("returns false when the key is missing", () => {
    const params = new URLSearchParams();

    expect(params.hasEffectiveValue("a", "1")).toBe(false);
  });
});

describe("URLSearchParams.prototype.trySet", () => {
  it("sets the value when the key does not exist", () => {
    const params = new URLSearchParams();

    params.trySet("a", "1");

    expect(params.get("a")).toBe("1");
  });

  it("does not overwrite an existing key", () => {
    const params = new URLSearchParams("a=1");

    params.trySet("a", "2");

    expect(params.getAll("a")).toEqual(["1"]);
  });

  it("returns the same instance", () => {
    const params = new URLSearchParams();

    expect(params.trySet("a", "1")).toBe(params);
  });
});

describe("URLSearchParams.prototype.add", () => {
  it("appends a single value", () => {
    const params = new URLSearchParams();

    params.add("a", "1");

    expect(params.getAll("a")).toEqual(["1"]);
  });

  it("appends multiple values from an array", () => {
    const params = new URLSearchParams();

    params.add("a", ["1", "2"]);

    expect(params.getAll("a")).toEqual(["1", "2"]);
  });

  it("appends empty strings for nullish values", () => {
    const params = new URLSearchParams();

    params.add("a", null);
    params.add("b", undefined);
    params.add("c", ["x", null, undefined]);

    expect(params.getAll("a")).toEqual([""]);
    expect(params.getAll("b")).toEqual([""]);
    expect(params.getAll("c")).toEqual(["x", "", ""]);
  });

  it("returns the same instance", () => {
    const params = new URLSearchParams();

    expect(params.add("a", "1")).toBe(params);
  });
});
