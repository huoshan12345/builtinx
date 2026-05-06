import type { Mock } from 'vitest';

describe("Node extensions", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Node.prototype.ownText", () => {
    it("returns text content for text node itself", () => {
      const node = document.createTextNode("hello");

      expect(node.ownText()).toBe("hello");
    });

    it("returns empty string for empty text node", () => {
      const node = document.createTextNode("");

      expect(node.ownText()).toBe("");
    });

    it("returns direct child text only", () => {
      const div = document.createElement("div");
      div.append("Hello ");
      div.appendChild(document.createElement("span")).textContent = "World";
      div.append(" !");

      expect(div.ownText()).toBe("Hello  !");
    });

    it("ignores descendant text nodes inside nested elements", () => {
      const div = document.createElement("div");
      const span = document.createElement("span");
      span.textContent = "inner";

      div.append("outer");
      div.appendChild(span);

      expect(div.ownText()).toBe("outer");
    });

    it("returns concatenated multiple direct text nodes", () => {
      const div = document.createElement("div");

      div.append("A");
      div.append("B");
      div.append("C");

      expect(div.ownText()).toBe("ABC");
    });

    it("returns empty string when no direct text child exists", () => {
      const div = document.createElement("div");
      div.appendChild(document.createElement("span"));

      expect(div.ownText()).toBe("");
    });

    it("includes whitespace text nodes", () => {
      const div = document.createElement("div");

      div.append(" ");
      div.append("X");
      div.append(" ");

      expect(div.ownText()).toBe(" X ");
    });
  });

  describe("Node.prototype.isTextNode", () => {
    it("returns true for text node", () => {
      const node = document.createTextNode("x");

      expect(node.isTextNode()).toBe(true);
    });

    it("returns false for element node", () => {
      const div = document.createElement("div");

      expect(div.isTextNode()).toBe(false);
    });

    it("returns false for comment node", () => {
      const node = document.createComment("x");

      expect(node.isTextNode()).toBe(false);
    });
  });

  describe("Node.prototype.isNewLineTextNode", () => {
    it("returns true for newline text node", () => {
      const node = document.createTextNode("\n");

      expect(node.isNewLineTextNode()).toBe(true);
    });

    it("returns false for normal text node", () => {
      const node = document.createTextNode("abc");

      expect(node.isNewLineTextNode()).toBe(false);
    });

    it("returns false for whitespace text node that is not newline", () => {
      const node = document.createTextNode(" ");

      expect(node.isNewLineTextNode()).toBe(false);
    });

    it("returns false for element node", () => {
      const div = document.createElement("div");

      expect(div.isNewLineTextNode()).toBe(false);
    });

    it("returns true for CRLF text node", () => {
      const node = document.createTextNode("\r\n");

      expect(node.isNewLineTextNode()).toBe(true);
    });
  });
});

describe('Node.prototype.observe', () => {

  let callback: Mock;
  let node: Node;

  let observeMock: Mock;
  let disconnectMock: Mock;
  let trigger: (records: MutationRecord[]) => void;

  beforeEach(() => {
    vi.useFakeTimers();

    callback = vi.fn();
    node = document.createTextNode("hello");

    observeMock = vi.fn();
    disconnectMock = vi.fn();

    (global as any).MutationObserver = vi.fn(function (cb: MutationCallback) {
      const instance = {
        observe: observeMock,
        disconnect: disconnectMock
      };

      trigger = (records: MutationRecord[]) => {
        cb(records, instance as unknown as MutationObserver);
      };

      return instance;
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function createMutation(type: MutationRecordType): MutationRecord {
    return { type } as MutationRecord;
  }

  test('should observe with correct native options', () => {
    node.observe(callback, {
      attributes: true
    });

    expect(observeMock).toHaveBeenCalledWith(node, expect.objectContaining({
      attributes: true,
      childList: true,
      subtree: true
    }));
  });

  test('should call callback with node parameter', () => {
    node.observe(callback);

    const records = [createMutation('attributes')];

    trigger(records);
    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledWith(records, expect.anything(), node);
  });

  test('should execute callAtOnce immediately', () => {
    node.observe(callback, {
      callAtOnce: true
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith([], expect.anything(), node);
  });

  test('should call beforeCallback and afterCallback (callAtOnce)', () => {
    const before = vi.fn();
    const after = vi.fn();

    node.observe(callback, {
      callAtOnce: true,
      beforeCallback: before,
      afterCallback: after
    });

    expect(before).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(after).toHaveBeenCalledTimes(1);

    expect(before.mock.invocationCallOrder[0])
      .toBeLessThan(callback.mock.invocationCallOrder[0]);

    expect(callback.mock.invocationCallOrder[0])
      .toBeLessThan(after.mock.invocationCallOrder[0]);
  });

  test('should debounce callback (default trailing)', () => {
    node.observe(callback, {
      debounceMs: 100,
      immediate: false,
      callAtOnce: false,
    });

    trigger([createMutation('attributes')]);
    trigger([createMutation('childList')]);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should execute immediately when immediate=true', () => {
    node.observe(callback, {
      immediate: true,
      callAtOnce: false,
    });

    trigger([createMutation('attributes')]);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should filter mutations using exclusions', () => {
    node.observe(callback, {
      callAtOnce: false,
      exclusions: [
        m => m.type === 'attributes'
      ]
    });

    const records = [
      createMutation('attributes'),
      createMutation('childList')
    ];

    trigger(records);
    vi.advanceTimersByTime(1000);

    const result = callback.mock.calls[0][0];

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('childList');
  });

  test('should skip callback when all mutations excluded', () => {
    const onSkipped = vi.fn();

    node.observe(callback, {
      callAtOnce: false,
      exclusions: [() => true],
      onSkipped
    });

    trigger([createMutation('attributes')]);
    vi.advanceTimersByTime(1000);

    expect(callback).not.toHaveBeenCalled();
    expect(onSkipped).toHaveBeenCalledTimes(1);
  });

  test('should call beforeCallback and afterCallback during debounce execution', () => {
    const before = vi.fn();
    const after = vi.fn();

    node.observe(callback, {
      callAtOnce: false,
      beforeCallback: before,
      afterCallback: after
    });

    trigger([createMutation('attributes')]);
    vi.advanceTimersByTime(1000);

    expect(before).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(after).toHaveBeenCalledTimes(1);
  });

  test('should pass observer instance correctly', () => {
    node.observe(callback);

    const records = [createMutation('attributes')];

    trigger(records);
    vi.advanceTimersByTime(1000);

    const observerInstance = callback.mock.calls[0][1];

    expect(observerInstance).toBeDefined();
  });

});