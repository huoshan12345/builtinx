beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Promise.delay", () => {
  it("resolves after specified milliseconds", async () => {
    const spy = vi.fn();

    Promise.delay(1000).then(spy);

    expect(spy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(999);
    expect(spy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("resolves immediately when ms is 0", async () => {
    const spy = vi.fn();

    Promise.delay(0).then(spy);

    await vi.runAllTimersAsync();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("Promise.prototype.delay", () => {
  it("delays resolved value", async () => {
    const spy = vi.fn();

    Promise.resolve(123)
      .delay(500)
      .then(spy);

    await vi.advanceTimersByTimeAsync(499);
    expect(spy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(spy).toHaveBeenCalledWith(123);
  });

  it("passes through immediately when ms <= 0", async () => {
    await expect(
      Promise.resolve("ok").delay(0)
    ).resolves.toBe("ok");
  });
});

describe("Promise.prototype.ignore", () => {
  it("returns resolved value unchanged", async () => {
    await expect(
      Promise.resolve(5).ignore()
    ).resolves.toBe(5);
  });

  it("swallows rejection", async () => {
    await expect(
      Promise.reject(new Error("x")).ignore()
    ).resolves.toBeUndefined();
  });

  it("invokes error callback", async () => {
    const spy = vi.fn();

    await Promise.reject(new Error("boom")).ignore(spy);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBeInstanceOf(Error);
  });
});

describe("Promise.prototype.tap", () => {
  it("invokes the action and preserves the resolved value", async () => {
    const action = vi.fn();

    await expect(Promise.resolve(5).tap(action)).resolves.toBe(5);
    expect(action).toHaveBeenCalledExactlyOnceWith(5);
  });

  it("accepts an expression-bodied action that returns a value", async () => {
    await expect(Promise.resolve(5).tap(value => value.toString())).resolves.toBe(5);
  });

  it("waits for an asynchronous action", async () => {
    let completed = false;
    const promise = Promise.resolve("ok").tap(async () => {
      await Promise.delay(100);
      completed = true;
    });

    await vi.advanceTimersByTimeAsync(99);
    expect(completed).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toBe("ok");
    expect(completed).toBe(true);
  });

  it("propagates errors from the action", async () => {
    await expect(
      Promise.resolve(5).tap(() => {
        throw new Error("tap failed");
      })
    ).rejects.toThrow("tap failed");
  });

  it("does not invoke the action for a rejected promise", async () => {
    const action = vi.fn();

    await expect(Promise.reject(new Error("source failed")).tap(action)).rejects.toThrow("source failed");
    expect(action).not.toHaveBeenCalled();
  });
});

describe("Promise.prototype.tapIf", () => {
  it("invokes the action only when the condition is true", async () => {
    const action = vi.fn();

    await expect(Promise.resolve(4).tapIf(value => value % 2 === 0, action)).resolves.toBe(4);
    expect(action).toHaveBeenCalledExactlyOnceWith(4);
  });

  it("skips the action when the condition is false", async () => {
    const action = vi.fn();

    await expect(Promise.resolve(3).tapIf(value => value % 2 === 0, action)).resolves.toBe(3);
    expect(action).not.toHaveBeenCalled();
  });

  it("propagates errors from the condition", async () => {
    await expect(
      Promise.resolve(5).tapIf(() => {
        throw new Error("condition failed");
      }, () => { })
    ).rejects.toThrow("condition failed");
  });
});

describe("Promise.retry", () => {
  it("resolves on first success", async () => {
    const factory = vi.fn(() => Promise.resolve("ok"));

    await expect(
      Promise.retry(factory, 3)
    ).resolves.toBe("ok");

    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("retries until success", async () => {
    let count = 0;

    const factory = vi.fn(() => {
      count++;

      if (count < 3) {
        return Promise.reject(new Error("fail"));
      }

      return Promise.resolve("done");
    });

    const promise = Promise.retry(factory, 5, 1000);

    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe("done");
    expect(factory).toHaveBeenCalledTimes(3);
  });

  it("rejects after exhausting retries", async () => {
    const factory = vi.fn(() =>
      Promise.reject(new Error("fail"))
    );

    const promise = expect(
      Promise.retry(factory, 2, 500)
    ).rejects.toThrow("fail");

    await vi.runAllTimersAsync();

    await promise;

    expect(factory).toHaveBeenCalledTimes(3);
  });

  it("waits between retries", async () => {
    const factory = vi.fn(() =>
      Promise.reject(new Error("x"))
    );

    Promise.retry(factory, 1, 1000).catch(() => { });

    expect(factory).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(999);
    expect(factory).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it("does not wait when delay is 0", async () => {
    const factory = vi.fn()
      .mockRejectedValueOnce(new Error("x"))
      .mockResolvedValueOnce("ok");

    const promise = Promise.retry(factory, 1, 0);

    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe("ok");
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
