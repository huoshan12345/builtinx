describe("RegExp.prototype.find", () => {
  it("returns first match", () => {
    const result = /ab/.find("xxabyyab");

    expect(result).not.toBeNull();
    expect(result![0]).toBe("ab");
    expect(result!.index).toBe(2);
  });

  it("returns null when no match exists", () => {
    const result = /ab/.find("xxxx");

    expect(result).toBeNull();
  });

  it("works with global regex", () => {
    const result = /ab/g.find("xxabyyab");

    expect(result).not.toBeNull();
    expect(result![0]).toBe("ab");
    expect(result!.index).toBe(2);
  });

  it("resets lastIndex before matching on global regex", () => {
    const regex = /ab/g;
    regex.lastIndex = 999;

    const result = regex.find("xxabyyab");

    expect(result).not.toBeNull();
    expect(result!.index).toBe(2);
  });

  it("restores the original lastIndex after matching on global regex", () => {
    const regex = /ab/g;
    regex.lastIndex = 5;

    regex.find("xxabyyab");

    expect(regex.lastIndex).toBe(5);
  });

  it("restores the original lastIndex when no match is found", () => {
    const regex = /ab/g;
    regex.lastIndex = 5;

    regex.find("xxxx");

    expect(regex.lastIndex).toBe(5);
  });

  it("supports capturing groups", () => {
    const result = /a(b)/.find("xxabyy");

    expect(result).not.toBeNull();
    expect(result![0]).toBe("ab");
    expect(result![1]).toBe("b");
    expect(result!.index).toBe(2);
  });

  it("works with ignore-case flag", () => {
    const result = /ab/i.find("xxAByy");

    expect(result).not.toBeNull();
    expect(result![0]).toBe("AB");
    expect(result!.index).toBe(2);
  });

  it("restores the original lastIndex of non-global regex", () => {
    const regex = /ab/;
    regex.lastIndex = 123;

    regex.find("xxabyy");

    expect(regex.lastIndex).toBe(123);
  });

  it("searches sticky patterns from their current lastIndex", () => {
    const regex = /ab/y;
    regex.lastIndex = 2;

    const result = regex.find("xxabyyab");

    expect(result?.index).toBe(2);
    expect(regex.lastIndex).toBe(2);
  });
});

describe("RegExp.prototype.findAll", () => {
  it("returns all matches when regex has global flag", () => {
    const result = /ab/g.findAll("xxabyyabzz");

    expect(result).toHaveLength(2);
    expect(result[0][0]).toBe("ab");
    expect(result[0].index).toBe(2);
    expect(result[1][0]).toBe("ab");
    expect(result[1].index).toBe(6);
  });

  it("returns all matches when regex has no global flag", () => {
    const result = /ab/.findAll("xxabyyabzz");

    expect(result).toHaveLength(2);
    expect(result[0].index).toBe(2);
    expect(result[1].index).toBe(6);
  });

  it("preserves other flags while adding global", () => {
    const result = /ab/i.findAll("xxAByyabzz");

    expect(result).toHaveLength(2);
    expect(result[0][0]).toBe("AB");
    expect(result[1][0]).toBe("ab");
  });

  it("returns empty array when no match exists", () => {
    const result = /ab/.findAll("xxxx");

    expect(result).toEqual([]);
  });

  it("supports capturing groups", () => {
    const result = /a(b)/.findAll("abxxab");

    expect(result).toHaveLength(2);
    expect(result[0][0]).toBe("ab");
    expect(result[0][1]).toBe("b");
    expect(result[1][0]).toBe("ab");
    expect(result[1][1]).toBe("b");
  });

  it("restores the original lastIndex for global regex after execution", () => {
    const regex = /ab/g;

    regex.lastIndex = 99;

    regex.findAll("abxxab");

    expect(regex.lastIndex).toBe(99);
  });

  it("does not mutate lastIndex of non-global regex", () => {
    const regex = /ab/;

    regex.lastIndex = 99;

    regex.findAll("abxxab");

    expect(regex.lastIndex).toBe(99);
  });

  it("handles zero-length matches safely", () => {
    const result = /^/gm.findAll("a\nb\nc");

    expect(result.length).toBe(3);
    expect(result[0].index).toBe(0);
    expect(result[1].index).toBe(2);
    expect(result[2].index).toBe(4);
  });

  it("works with unicode flag", () => {
    const result = /./u.findAll("猫狗");

    expect(result).toHaveLength(2);
    expect(result[0][0]).toBe("猫");
    expect(result[1][0]).toBe("狗");
  });

  it("preserves sticky semantics while adding global", () => {
    const regex = /ab/y;
    regex.lastIndex = 2;

    const result = regex.findAll("xxababyyab");

    expect(result.map(match => match.index)).toEqual([2, 4]);
    expect(regex.lastIndex).toBe(2);
  });
});
