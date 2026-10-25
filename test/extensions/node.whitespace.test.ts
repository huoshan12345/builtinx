describe('Node whitespace predicates', () => {
  const cases: [string, string, boolean, boolean][] = [
    ['empty text', '', false, true],
    ['spaces', '   ', false, true],
    ['tabs', '\t\t', false, true],
    ['LF', '\n', true, true],
    ['CR', '\r', true, true],
    ['CRLF', '\r\n', true, true],
    ['mixed whitespace', ' \t\r\n \n', true, true],
    ['non-breaking space', '\u00a0', false, true],
    ['Unicode line separator', '\u2028', false, true],
    ['zero-width space', '\u200b', false, false],
    ['plain text', 'hello', false, false],
    ['text with newline', 'hello\n', false, false],
  ];

  it.each(cases)('classifies %s through prototype and static methods', (_, value, lineBreak, whitespace) => {
    const node = document.createTextNode(value);

    expect(node.isLineBreakTextNode()).toBe(lineBreak);
    expect(BuiltinX.Node.isLineBreakTextNode(node)).toBe(lineBreak);
    expect(node.isWhitespaceTextNode()).toBe(whitespace);
    expect(BuiltinX.Node.isWhitespaceTextNode(node)).toBe(whitespace);
  });

  it('rejects non-Text nodes even when their content is whitespace', () => {
    const div = document.createElement('div');
    div.textContent = '\n';
    const fragment = document.createDocumentFragment();
    fragment.append('\n');
    const xmlDocument = document.implementation.createDocument(null, 'root');

    for (const node of [div, document.createComment('\n'), fragment, document, xmlDocument.createCDATASection('\n')]) {
      expect(node.isLineBreakTextNode()).toBe(false);
      expect(BuiltinX.Node.isLineBreakTextNode(node)).toBe(false);
      expect(node.isWhitespaceTextNode()).toBe(false);
      expect(BuiltinX.Node.isWhitespaceTextNode(node)).toBe(false);
    }
  });

  it('supports iframe Text nodes through static methods', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    try {
      for (const [, value, lineBreak, whitespace] of cases) {
        const node = frame.contentDocument!.createTextNode(value);
        expect(node.isLineBreakTextNode).toBeUndefined();
        expect(node.isWhitespaceTextNode).toBeUndefined();
        expect(BuiltinX.Node.isLineBreakTextNode(node)).toBe(lineBreak);
        expect(BuiltinX.Node.isWhitespaceTextNode(node)).toBe(whitespace);
      }
    } finally {
      frame.remove();
    }
  });

  it.each(['isLineBreakTextNode', 'isWhitespaceTextNode'])('registers %s as non-enumerable', name => {
    expect(Object.getOwnPropertyDescriptor(Node.prototype, name)).toMatchObject({
      value: expect.any(Function),
      enumerable: false,
      configurable: true,
      writable: true,
    });
  });
});
