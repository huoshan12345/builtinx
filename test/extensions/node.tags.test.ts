describe('Node tag predicates', () => {
  const predicates = ['isBr', 'isFont', 'isBlockTag'] as const;
  const htmlNamespace = 'http://www.w3.org/1999/xhtml';

  const tagCases: [string, boolean, boolean, boolean][] = [
    ['br', true, false, false],
    ['font', false, true, false],
    ...[
      'div', 'blockquote', 'p', 'li', 'td', 'th', 'body',
      'section', 'article', 'main', 'aside', 'header', 'footer',
    ].map((tag): [string, boolean, boolean, boolean] => [tag, false, false, true]),
    ['span', false, false, false],
    ['h1', false, false, false],
  ];

  it.each(tagCases)('classifies HTML <%s> through prototype and static methods', (tag, ...expected) => {
    const element = document.createElement(tag);

    predicates.forEach((name, index) => {
      expect(element[name]()).toBe(expected[index]);
      expect(BuiltinX.Node[name](element)).toBe(expected[index]);
    });
  });

  it('returns false for non-element nodes', () => {
    const nodes = [
      document.createTextNode('br'),
      document.createComment('font'),
      document.createDocumentFragment(),
      document,
      document.createAttribute('div'),
    ];

    for (const node of nodes) {
      for (const name of predicates) {
        expect(node[name]()).toBe(false);
        expect(BuiltinX.Node[name](node)).toBe(false);
      }
    }
  });

  it('rejects matching names in SVG, XML, and custom namespaces', () => {
    for (const namespace of [null, 'http://www.w3.org/2000/svg', 'urn:custom']) {
      for (const tag of ['br', 'BR', 'font', 'FONT', 'div', 'DIV']) {
        const element = document.createElementNS(namespace, tag);
        for (const name of predicates) {
          expect(element[name]()).toBe(false);
          expect(BuiltinX.Node[name](element)).toBe(false);
        }
      }
    }
  });

  it('recognizes XHTML elements, including prefixed names', () => {
    const xmlDocument = document.implementation.createDocument(htmlNamespace, 'html');
    expect(xmlDocument.defaultView).toBeNull();

    for (const [tag, ...expected] of tagCases) {
      for (const qualifiedName of [tag, `html:${tag}`]) {
        const element = xmlDocument.createElementNS(htmlNamespace, qualifiedName);
        predicates.forEach((name, index) => {
          expect(element[name]()).toBe(expected[index]);
          expect(BuiltinX.Node[name](element)).toBe(expected[index]);
        });
      }
    }
  });

  it('ignores CSS display overrides', () => {
    const div = document.createElement('div');
    const span = document.createElement('span');
    div.style.display = 'inline';
    span.style.display = 'block';

    expect(div.isBlockTag()).toBe(true);
    expect(span.isBlockTag()).toBe(false);
  });

  it('supports iframe nodes through static methods without installing extensions there', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    try {
      for (const [tag, ...expected] of tagCases) {
        const element = frame.contentDocument!.createElement(tag);
        predicates.forEach((name, index) => {
          expect(element[name]).toBeUndefined();
          expect(BuiltinX.Node[name](element)).toBe(expected[index]);
        });
      }
    } finally {
      frame.remove();
    }
  });

  it.each(predicates)('registers %s as a non-enumerable method', name => {
    expect(Object.getOwnPropertyDescriptor(Node.prototype, name)).toMatchObject({
      value: expect.any(Function),
      enumerable: false,
      writable: true,
      configurable: true,
    });
  });
});
