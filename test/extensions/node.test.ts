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