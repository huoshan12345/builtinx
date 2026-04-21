describe("console.styled", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("logs plain strings", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => { });

    console.styled("hello", " world");

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("hello world");
  });

  it("logs styled text", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => { });

    console.styled({
      text: "hello",
      color: "red"
    });

    expect(spy).toHaveBeenCalledWith(
      "%chello",
      "color: red"
    );
  });

  it("supports multiple styled segments", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => { });

    console.styled(
      { text: "A", color: "red" },
      { text: "B", color: "blue" }
    );

    expect(spy).toHaveBeenCalledWith(
      "%cA%cB",
      "color: red",
      "color: blue"
    );
  });

  it("supports mixed plain and styled segments", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => { });

    console.styled(
      "before ",
      { text: "X", color: "green" },
      " after"
    );

    expect(spy).toHaveBeenCalledWith(
      "before %cX after",
      "color: green"
    );
  });

  it("supports multiple css properties", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => { });

    console.styled({
      text: "hello",
      color: "red",
      fontWeight: "bold",
      background: "black"
    });

    expect(spy).toHaveBeenCalledWith(
      "%chello",
      "color: red; fontWeight: bold; background: black"
    );
  });

  it("uses empty string when text is null", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => { });

    console.styled({
      text: null,
      color: "red"
    });

    expect(spy).toHaveBeenCalledWith(
      "%c",
      "color: red"
    );
  });

  it("ignores null and undefined arguments", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => { });

    console.styled(
      "a",
      null,
      undefined,
      "b"
    );

    expect(spy).toHaveBeenCalledWith("ab");
  });

  it("logs once when no arguments are provided", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => { });

    console.styled();

    expect(spy).not.toHaveBeenCalled();
  });

  it("supports empty style object", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => { });

    console.styled({
      text: "x"
    });

    expect(spy).toHaveBeenCalledWith(
      "%cx",
      ""
    );
  });
});

describe("console.color", () => {
  it("logs colored text", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    console.color("hello", "red");

    expect(spy).toHaveBeenCalledWith(
      "%chello",
      "color: red"
    );
  });

  it("supports numbers", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    console.color(123, "blue");

    expect(spy).toHaveBeenCalledWith(
      "%c123",
      "color: blue"
    );
  });

  it("supports empty text", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    console.color("", "green");

    expect(spy).toHaveBeenCalledWith(
      "%c",
      "color: green"
    );
  });

  it("passes color as provided", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    console.color("x", "#ff0000");

    expect(spy).toHaveBeenCalledWith(
      "%cx",
      "color: #ff0000"
    );
  });
});