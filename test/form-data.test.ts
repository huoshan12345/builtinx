describe("FormData.prototype.add", () => {
  it("appends string value", () => {
    const fd = new FormData();

    fd.add("name", "Tom");

    expect(fd.get("name")).toBe("Tom");
  });

  it("appends empty string for null", () => {
    const fd = new FormData();

    fd.add("name", null);

    expect(fd.get("name")).toBe("");
  });

  it("returns same instance", () => {
    const fd = new FormData();

    expect(fd.add("x", "1")).toBe(fd);
  });
});

describe("FormData.prototype.toParams", () => {
  it("converts string entries", () => {
    const fd = new FormData();

    fd.add("a", "1").add("b", "2");

    const p = fd.toParams();

    expect(p.get("a")).toBe("1");
    expect(p.get("b")).toBe("2");
  });

  it("ignores blob entries", () => {
    const fd = new FormData();

    fd.add("file", new Blob(["x"]));

    const p = fd.toParams();

    expect(p.has("file")).toBe(false);
  });
});