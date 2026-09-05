import { expectTypeOf } from 'vitest';

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("Element.prototype.setVisible(false)", () => {
  it("sets display to none", () => {
    const div = document.createElement("div");

    div.setVisible(false);

    expect(div.style.display).toBe("none");
  });

  it("returns same element", () => {
    const div = document.createElement("div");

    expect(div.setVisible(false)).toBe(div);
  });

  it("preserves existing display value for later restore", () => {
    const div = document.createElement("div");
    div.style.display = "flex";

    div.setVisible(false);

    expect(div.style.display).toBe("none");
    expect(div.dataset.builtinxDisplay).toBe("flex");
  });

  it("does not overwrite saved display when already hidden", () => {
    const div = document.createElement("div");
    div.style.display = "grid";

    div.setVisible(false);
    div.setVisible(false);

    expect(div.dataset.builtinxDisplay).toBe("grid");
  });
});

describe("Element.prototype.setVisible(true)", () => {
  it("restores empty display by default", () => {
    const div = document.createElement("div");

    div.setVisible(false);
    div.setVisible(true);

    expect(div.style.display).toBe("");
  });

  it("restores previous display value", () => {
    const div = document.createElement("div");
    div.style.display = "inline-block";

    div.setVisible(false);
    div.setVisible(true);

    expect(div.style.display).toBe("inline-block");
  });

  it("clears display none when no previous display was saved", () => {
    const div = document.createElement("div");
    div.style.display = "none";

    div.setVisible(false).setVisible(true);

    expect(div.style.display).toBe("");
    expect(div.dataset.builtinxDisplay).toBeUndefined();
  });

  it("preserves the latest display value across repeated cycles", () => {
    const div = document.createElement("div");
    div.style.display = "flex";

    div.setVisible(false).setVisible(false).setVisible(true).setVisible(true);
    expect(div.style.display).toBe("flex");

    div.style.display = "grid";
    div.setVisible(false).setVisible(true);
    expect(div.style.display).toBe("grid");
  });

  it("removes saved display after restore", () => {
    const div = document.createElement("div");
    div.style.display = "flex";

    div.setVisible(false);
    div.setVisible(true);

    expect(div.dataset.builtinxDisplay).toBeUndefined();
  });

  it("does nothing when element is not hidden", () => {
    const div = document.createElement("div");
    div.style.display = "block";

    div.setVisible(true);

    expect(div.style.display).toBe("block");
  });

  it("returns same element", () => {
    const div = document.createElement("div");

    expect(div.setVisible(true)).toBe(div);
  });

  it("supports chaining", () => {
    const div = document.createElement("div");

    div.setVisible(false).setVisible(true).setVisible(false);

    expect(div.style.display).toBe("none");
  });

  it("preserves the concrete element type", () => {
    const div = document.createElement("div");

    expectTypeOf(div.setVisible(false).setVisible(true)).toEqualTypeOf<HTMLDivElement>();
  });

  it("restores SVG display and supports chaining", () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.display = "inline";

    expect(svg.setVisible(false).setVisible(true)).toBe(svg);
    expect(svg.style.display).toBe("inline");
    expectTypeOf(svg.setVisible(true)).toEqualTypeOf<SVGSVGElement>();
  });

  it("restores dialog display while preserving the native show type", () => {
    const dialog = document.createElement("dialog");
    document.body.append(dialog);
    dialog.style.display = "block";

    expectTypeOf(dialog).toExtend<Element>();
    expectTypeOf(dialog.show).returns.toBeVoid();
    expectTypeOf(dialog.setVisible(true)).toEqualTypeOf<HTMLDialogElement>();
    expect(dialog.setVisible(false).setVisible(true)).toBe(dialog);
    expect(dialog.style.display).toBe("block");
    expect(dialog.open).toBe(false);
  });

  it("restores dialog display without calling native show", () => {
    const dialog = document.createElement("dialog");
    dialog.style.display = "flex";
    // jsdom does not implement HTMLDialogElement.show yet.
    const show = vi.fn((): void => {
      dialog.open = true;
    });
    dialog.show = show;

    expect(dialog.setVisible(false)).toBe(dialog);
    expect(dialog.style.display).toBe("none");
    expect(dialog.setVisible(true)).toBe(dialog);
    expect(dialog.style.display).toBe("flex");
    expect(dialog.open).toBe(false);
    expect(show).not.toHaveBeenCalled();
  });
});

describe("Element.prototype.collapseBrs", () => {
  it("removes consecutive br elements", () => {
    const div = document.createElement("div");
    div.innerHTML = "A<br><br><br>B";

    div.collapseBrs();

    expect(div.innerHTML).toBe("A<br>B");
  });

  it("removes newline text nodes after br", () => {
    const div = document.createElement("div");
    div.append("A");

    const br = document.createElement("br");
    div.append(br);
    div.append(document.createTextNode("\n"));
    div.append(document.createTextNode("\n"));
    div.append("B");

    div.collapseBrs();

    expect(div.innerHTML).toBe("A<br>B");
  });

  it("removes mixed br and newline nodes after br", () => {
    const div = document.createElement("div");
    div.innerHTML = "A<br><br>B";

    const firstBr = div.querySelector("br")!;
    firstBr.after(document.createTextNode("\n"));

    div.collapseBrs();

    expect(div.innerHTML).toBe("A<br>B");
  });

  it("returns same element", () => {
    const div = document.createElement("div");

    expect(div.collapseBrs()).toBe(div);
  });

  it("does nothing when no br exists", () => {
    const div = document.createElement("div");
    div.textContent = "ABC";

    div.collapseBrs();

    expect(div.innerHTML).toBe("ABC");
  });
});

describe("Element.prototype.trimLeadingBrs", () => {
  it("removes leading br elements", () => {
    const div = document.createElement("div");
    div.innerHTML = "<br><br>Hello";

    div.trimLeadingBrs();

    expect(div.innerHTML).toBe("Hello");
  });

  it("removes leading newline text nodes", () => {
    const div = document.createElement("div");

    div.append(document.createTextNode("\n"));
    div.append(document.createTextNode("\n"));
    div.append("Hello");

    div.trimLeadingBrs();

    expect(div.innerHTML).toBe("Hello");
  });

  it("removes mixed leading br and newline nodes", () => {
    const div = document.createElement("div");

    div.append(document.createElement("br"));
    div.append(document.createTextNode("\n"));
    div.append(document.createElement("br"));
    div.append("Hello");

    div.trimLeadingBrs();

    expect(div.innerHTML).toBe("Hello");
  });

  it("does not remove non-leading br", () => {
    const div = document.createElement("div");
    div.innerHTML = "Hello<br>";

    div.trimLeadingBrs();

    expect(div.innerHTML).toBe("Hello<br>");
  });

  it("returns same element", () => {
    const div = document.createElement("div");

    expect(div.trimLeadingBrs()).toBe(div);
  });
});

describe("Element.prototype.getDocumentRect", () => {
  it("adds scroll offsets to bounding rect", () => {
    const div = document.createElement("div");

    Object.defineProperty(window, "scrollX", {
      configurable: true,
      value: 50
    });

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 100
    });

    div.getBoundingClientRect = () =>
      ({
        left: 10,
        top: 20,
        width: 300,
        height: 150,
        right: 310,
        bottom: 170,
        x: 10,
        y: 20,
        toJSON() { }
      }) as DOMRect;

    const rect = div.getDocumentRect();

    expect(rect.left).toBe(60);
    expect(rect.top).toBe(120);
    expect(rect.width).toBe(300);
    expect(rect.height).toBe(150);
  });

  it("returns DOMRectReadOnly", () => {
    const div = document.createElement("div");

    div.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        width: 1,
        height: 1,
        right: 1,
        bottom: 1,
        x: 0,
        y: 0,
        toJSON() { }
      }) as DOMRect;

    const rect = div.getDocumentRect();

    expect(rect).toBeInstanceOf(DOMRectReadOnly);
  });
});
