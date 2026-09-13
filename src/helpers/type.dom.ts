const getNodeType = Object.getOwnPropertyDescriptor(Node.prototype, 'nodeType')!.get!;

/**
 * Returns true if the value is a DOM Node, including elements, text, comments,
 * documents, document fragments, and attributes.
 * Uses the native nodeType getter to validate the receiver, supporting nodes
 * from accessible iframes and documents without a window. Objects that only
 * imitate Node properties or inherit from Node.prototype are rejected.
 * @param value The value to inspect.
 * @returns Whether the value is a Node, narrowing its TypeScript type when true.
 * @example
 * BuiltinX.isNode(document.createTextNode("hello")) // true
 * BuiltinX.isNode(document.body)                   // true
 * BuiltinX.isNode({ nodeType: 1 })                  // false
 */
export function isNode(value: unknown): value is Node {
  if (value == null || typeof value !== 'object') {
    return false;
  }

  try {
    // Same trick as isElement: the native getter brand-checks the receiver
    // independent of realm/prototype identity, so this works across iframes too.
    getNodeType.call(value);
    return true;
  } catch {
    return false;
  }
}

const getElementTagName = Object.getOwnPropertyDescriptor(Element.prototype, 'tagName')!.get!;

/**
 * Returns true if the value is a DOM Element, including HTML, SVG, and XML elements.
 * Other nodes, such as text, documents, and document fragments, return false.
 * Uses the native tagName getter to validate the receiver, supporting elements
 * from accessible iframes, documents without a window, and adopted elements.
 * Objects that only imitate Element properties or inherit from Element.prototype
 * are rejected.
 * @param value The value to inspect.
 * @returns Whether the value is an Element, narrowing its TypeScript type when true.
 * @example
 * BuiltinX.isElement(document.body)                    // true
 * BuiltinX.isElement(document.createTextNode("hello")) // false
 * BuiltinX.isElement({ nodeType: 1, tagName: "DIV" })   // false
 */
export function isElement(value: unknown): value is Element {
  if (value == null || typeof value !== "object") {
    return false;
  }

  try {
    // The native getter validates the Element receiver without relying on its realm
    // or ownerDocument, which may have no window or may change after adoption.
    getElementTagName.call(value);
    return true;
  } catch {
    return false;
  }
}
