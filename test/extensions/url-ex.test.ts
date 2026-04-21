describe("URLEx.create", () => {
  it("creates an absolute URL", () => {
    const url = URLEx.create("https://example.com/path?q=1");

    expect(url).toBeInstanceOf(URL);
    expect(url.href).toBe("https://example.com/path?q=1");
  });

  it("creates a relative URL with a base", () => {
    const url = URLEx.create("child", "https://example.com/root/");

    expect(url.href).toBe("https://example.com/root/child");
  });

  it("accepts URL objects for both url and base", () => {
    const url = URLEx.create(new URL("child", "https://example.com/root/"), new URL("https://ignored.test/"));

    expect(url.href).toBe("https://example.com/root/child");
  });

  it("throws a normalized error message for invalid absolute URLs", () => {
    expect(() => URLEx.create("://bad")).toThrow("Invalid URL: ://bad");
  });

  it("throws a normalized error message for invalid relative URLs with base", () => {
    expect(() => URLEx.create("child", "://bad-base")).toThrow("Invalid URL: child (base: ://bad-base)");
  });
});

describe("URLEx.goto", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("does nothing for nullish values", () => {
    const assign = vi.fn();
    const originalLocation = window.location;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        set href(value: string) {
          assign(value);
        },
        get href() {
          return originalLocation.href;
        },
      },
    });

    URLEx.goto(null);
    URLEx.goto(undefined);

    expect(assign).not.toHaveBeenCalled();

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("navigates the current page by assigning window.location.href", () => {
    const originalLocation = window.location;
    const assign = vi.fn();

    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        set href(value: string) {
          assign(value);
        },
        get href() {
          return originalLocation.href;
        },
      },
    });

    URLEx.goto("https://example.com/next");

    expect(assign).toHaveBeenCalledWith("https://example.com/next");

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("opens a new tab through a temporary anchor", () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.href).toBe("https://example.com/next");
        expect(this.target).toBe("_blank");
        expect(this.rel).toBe("noopener");
      });

    URLEx.goto("https://example.com/next", true);

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(document.querySelector("a")).toBeNull();
  });

  it("uses noreferrer and noopener when noReferrer is true", () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.href).toBe("https://example.com/next");
        expect(this.target).toBe("_blank");
        expect(this.rel).toBe("noreferrer noopener");
      });

    URLEx.goto("https://example.com/next", true, true);

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(document.querySelector("a")).toBeNull();
  });
});

describe("URLEx.fromSegments", () => {
  it("appends path segments to the base URL", () => {
    const url = URLEx.fromSegments("https://example.com/root", "child", "leaf");

    expect(url.href).toBe("https://example.com/root/child/leaf");
  });

  it("ignores empty segments and trims spaces and slashes", () => {
    const url = URLEx.fromSegments("https://example.com/root/", " /child/ ", "", " /leaf ");

    expect(url.href).toBe("https://example.com/root/child/leaf");
  });

  it("preserves query and hash components from the base URL", () => {
    const url = URLEx.fromSegments("https://example.com/root?x=1#frag", "child");

    expect(url.href).toBe("https://example.com/root/child?x=1#frag");
  });

  it("collapses repeated slashes in the base pathname", () => {
    const url = URLEx.fromSegments("https://example.com/root//nested///", "child");

    expect(url.href).toBe("https://example.com/root/nested/child");
  });

  it("accepts URL objects as the base", () => {
    const url = URLEx.fromSegments(new URL("https://example.com/root/"), "child");

    expect(url.href).toBe("https://example.com/root/child");
  });
});
