import "@/extensions/html-element";

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("HTMLElement.prototype.isVisible", () => {
  it("returns false when element has no size and no client rects", () => {
    const div = document.createElement("div");

    Object.defineProperty(div, "offsetWidth", {
      configurable: true,
      value: 0
    });

    Object.defineProperty(div, "offsetHeight", {
      configurable: true,
      value: 0
    });

    div.getClientRects = () =>
      ({
        length: 0,
        item: () => null,
        [Symbol.iterator]: function* () { }
      }) as DOMRectList;

    expect(div.isVisible()).toBe(false);
  });

  it("returns true when offsetWidth is greater than zero", () => {
    const div = document.createElement("div");

    Object.defineProperty(div, "offsetWidth", {
      configurable: true,
      value: 100
    });

    Object.defineProperty(div, "offsetHeight", {
      configurable: true,
      value: 0
    });

    div.getClientRects = () =>
      ({
        length: 0,
        item: () => null,
        [Symbol.iterator]: function* () { }
      }) as DOMRectList;

    expect(div.isVisible()).toBe(true);
  });

  it("returns true when offsetHeight is greater than zero", () => {
    const div = document.createElement("div");

    Object.defineProperty(div, "offsetWidth", {
      configurable: true,
      value: 0
    });

    Object.defineProperty(div, "offsetHeight", {
      configurable: true,
      value: 20
    });

    div.getClientRects = () =>
      ({
        length: 0,
        item: () => null,
        [Symbol.iterator]: function* () { }
      }) as DOMRectList;

    expect(div.isVisible()).toBe(true);
  });

  it("returns true when client rects exist", () => {
    const div = document.createElement("div");

    Object.defineProperty(div, "offsetWidth", {
      configurable: true,
      value: 0
    });

    Object.defineProperty(div, "offsetHeight", {
      configurable: true,
      value: 0
    });

    div.getClientRects = () =>
      ({
        length: 1,
        item: () => null,
        [Symbol.iterator]: function* () { }
      }) as DOMRectList;

    expect(div.isVisible()).toBe(true);
  });
});

describe("HTMLElement.prototype.setVisible", () => {
  it("shows element when value is true", () => {
    const div = document.createElement("div");

    div.hide();
    div.setVisible(true);

    expect(div.style.display).toBe("");
  });

  it("hides element when value is false", () => {
    const div = document.createElement("div");

    div.setVisible(false);

    expect(div.style.display).toBe("none");
  });

  it("returns same element when showing", () => {
    const div = document.createElement("div");

    expect(div.setVisible(true)).toBe(div);
  });

  it("returns same element when hiding", () => {
    const div = document.createElement("div");

    expect(div.setVisible(false)).toBe(div);
  });

  it("preserves previous display value when restored", () => {
    const div = document.createElement("div");
    div.style.display = "flex";

    div.setVisible(false);
    div.setVisible(true);

    expect(div.style.display).toBe("flex");
  });
});