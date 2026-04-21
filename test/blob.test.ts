import { describe, expect, it } from "vitest";
import "@/extensions/blob";

describe("Blob.prototype.toBase64", () => {
  it("converts text blob to base64", async () => {
    const blob = new Blob(["hello"], { type: "text/plain" });

    const result = await blob.toBase64();

    expect(result).toBe("aGVsbG8=");
  });

  it("works with empty blob", async () => {
    const blob = new Blob([]);

    const result = await blob.toBase64();

    expect(typeof result).toBe("string");
  });

  it("returns different values for different contents", async () => {
    const a = await new Blob(["a"]).toBase64();
    const b = await new Blob(["b"]).toBase64();

    expect(a).not.toBe(b);
  });
});

describe("Blob.prototype.download", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("creates object url", () => {
    const createSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:test");

    const revokeSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => { });

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => { });

    const blob = new Blob(["hello"]);

    blob.download("a.txt");

    expect(createSpy).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalled();

    createSpy.mockRestore();
    revokeSpy.mockRestore();
    clickSpy.mockRestore();
  });

  it("sets filename", () => {
    const createSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:test");

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.download).toBe("file.txt");
      });

    const revokeSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => { });

    new Blob(["x"]).download("file.txt");

    createSpy.mockRestore();
    clickSpy.mockRestore();
    revokeSpy.mockRestore();
  });

  it("removes temporary anchor element", () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => { });
    vi.spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => { });

    new Blob(["x"]).download("a.txt");

    expect(document.querySelector("a")).toBeNull();
  });
});