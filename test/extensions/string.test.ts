describe("String.prototype.trimChars", () => {
  it("trims ASCII characters from both ends", () => {
    expect("--hello--".trimChars("-")).toBe("hello");
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
