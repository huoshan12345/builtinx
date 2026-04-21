describe("Response.prototype.throwIfNotOk", () => {
  it("returns the same response when ok is true", async () => {
    const response = new Response("hello", {
      status: 200,
      statusText: "OK",
    });

    await expect(response.throwIfNotOk()).resolves.toBe(response);
  });

  it("throws an error that includes status and response text", async () => {
    const response = new Response("resource missing", {
      status: 404,
      statusText: "Not Found",
    });

    await expect(response.throwIfNotOk()).rejects.toThrow("404 Not Found: resource missing");
  });

  it("falls back to the status line when the body is empty", async () => {
    const response = new Response("", {
      status: 500,
      statusText: "Internal Server Error",
    });

    await expect(response.throwIfNotOk()).rejects.toThrow("500 Internal Server Error");
  });

  it("falls back to the numeric status when statusText is empty", async () => {
    const response = new Response("", {
      status: 418,
      statusText: "",
    });

    await expect(response.throwIfNotOk()).rejects.toThrow("418");
  });
});

describe("Response.prototype.download", () => {
  it("downloads the response blob when the response is ok", async () => {
    const response = new Response("hello", {
      status: 200,
      statusText: "OK",
      headers: {
        "Content-Type": "text/plain",
      },
    });

    const downloadSpy = vi
      .spyOn(Blob.prototype, "download")
      .mockResolvedValue();

    await response.download("hello.txt");

    expect(downloadSpy).toHaveBeenCalledTimes(1);
    expect(downloadSpy.mock.calls[0][0]).toBe("hello.txt");
  });

  it("rejects and does not download when the response is not ok", async () => {
    const response = new Response("access denied", {
      status: 403,
      statusText: "Forbidden",
    });

    const downloadSpy = vi
      .spyOn(Blob.prototype, "download")
      .mockResolvedValue();

    await expect(response.download("secret.txt")).rejects.toThrow("403 Forbidden: access denied");
    expect(downloadSpy).not.toHaveBeenCalled();
  });
});
