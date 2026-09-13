import { expectTypeOf } from 'vitest';
import { BuiltinX } from '@/index.js';
import '@/dom.js';

describe('BuiltinX DOM type guards', () => {
  const nodeCases: [string, () => Node, boolean][] = [
    ['HTML element', () => document.createElement('div'), true],
    ['SVG element', () => document.createElementNS('http://www.w3.org/2000/svg', 'svg'), true],
    ['XML element', () => document.implementation.createDocument(null, 'root').documentElement, true],
    ['text', () => document.createTextNode('hello'), false],
    ['empty text', () => document.createTextNode(''), false],
    ['comment', () => document.createComment('hello'), false],
    ['document', () => document, false],
    ['document fragment', () => document.createDocumentFragment(), false],
    ['shadow root', () => document.createElement('div').attachShadow({ mode: 'open' }), false],
    ['attribute', () => document.createAttribute('title'), false],
    ['document type', () => document.implementation.createDocumentType('html', '', ''), false],
    ['CDATA section', () => document.implementation.createDocument(null, 'root').createCDATASection('hello'), false],
    ['processing instruction', () => document.createProcessingInstruction('target', 'data'), false],
  ];

  it.each(nodeCases)('recognizes %s and distinguishes nodes from elements', (_, createNode, isElement) => {
    const value: unknown = createNode();

    expect(BuiltinX.isNode(value)).toBe(true);
    expect(BuiltinX.isElement(value)).toBe(isElement);
  });

  const nonNodeCases: [string, () => unknown][] = [
    ['null', () => null],
    ['undefined', () => undefined],
    ['string', () => 'div'],
    ['empty string', () => ''],
    ['number', () => 1],
    ['zero', () => 0],
    ['NaN', () => NaN],
    ['boolean', () => false],
    ['bigint', () => 1n],
    ['symbol', () => Symbol('Node')],
    ['function', () => () => {}],
    ['array', () => []],
    ['plain object', () => ({})],
    ['null-prototype object', () => Object.create(null)],
    ['date', () => new Date()],
    ['window', () => window],
    ['node list', () => document.querySelectorAll('*')],
    ['HTML collection', () => document.children],
    ['event', () => new Event('click')],
    ['Node prototype', () => Node.prototype],
    ['Element prototype', () => Element.prototype],
    ['fake Node prototype chain', () => Object.create(Node.prototype)],
    ['fake Element prototype chain', () => Object.create(Element.prototype)],
    ['fake DOM properties', () => ({ nodeType: 1, nodeName: 'DIV', tagName: 'DIV', ownerDocument: document })],
    ['fake Node tag', () => ({ [Symbol.toStringTag]: 'Node' })],
    ['fake Element tag', () => ({ [Symbol.toStringTag]: 'HTMLDivElement' })],
  ];

  it.each(nonNodeCases)('rejects %s', (_, createValue) => {
    const value = createValue();

    expect(BuiltinX.isNode(value)).toBe(false);
    expect(BuiltinX.isElement(value)).toBe(false);
  });

  it('does not read user-defined DOM properties', () => {
    const readProperty = vi.fn(() => {
      throw new Error('Unexpected property access');
    });
    const descriptors = {
      nodeType: { get: readProperty },
      tagName: { get: readProperty },
      ownerDocument: { get: readProperty },
      [Symbol.toStringTag]: { get: readProperty },
    };
    const fake = Object.defineProperties({}, descriptors);
    const element = Object.defineProperties(document.createElement('div'), descriptors);

    expect(BuiltinX.isNode(fake)).toBe(false);
    expect(BuiltinX.isElement(fake)).toBe(false);
    expect(BuiltinX.isNode(element)).toBe(true);
    expect(BuiltinX.isElement(element)).toBe(true);
    expect(readProperty).not.toHaveBeenCalled();
  });

  it('returns false instead of throwing for a revoked proxy', () => {
    const { proxy, revoke } = Proxy.revocable({}, {});
    revoke();

    expect(BuiltinX.isNode(proxy)).toBe(false);
    expect(BuiltinX.isElement(proxy)).toBe(false);
  });

  it('supports documents without a window and their detached elements', () => {
    const detachedDocument = document.implementation.createHTMLDocument('Detached');
    const element = detachedDocument.createElement('div');

    expect(detachedDocument.defaultView).toBeNull();
    expect(element.isConnected).toBe(false);
    expect(BuiltinX.isNode(detachedDocument)).toBe(true);
    expect(BuiltinX.isElement(detachedDocument)).toBe(false);
    expect(BuiltinX.isNode(element)).toBe(true);
    expect(BuiltinX.isElement(element)).toBe(true);
  });

  it('narrows unknown values to Node and Element', () => {
    const node: unknown = document.createTextNode('hello');
    const element: unknown = document.createElement('div');

    expect(BuiltinX.isNode(node)).toBe(true);
    if (BuiltinX.isNode(node)) {
      expectTypeOf(node).toEqualTypeOf<Node>();
      expect(node.textContent).toBe('hello');
    }

    expect(BuiltinX.isElement(element)).toBe(true);
    if (BuiltinX.isElement(element)) {
      expectTypeOf(element).toEqualTypeOf<Element>();
      expect(element.tagName).toBe('DIV');
    }
  });

  describe('iframe nodes', () => {
    let frame: HTMLIFrameElement;
    let frameDocument: Document;

    beforeEach(() => {
      frame = document.createElement('iframe');
      document.body.appendChild(frame);
      frameDocument = frame.contentDocument!;
    });

    afterEach(() => {
      frame.remove();
    });

    it('recognizes nodes from another realm without relying on instanceof', () => {
      const element = frameDocument.createElement('div');
      const svg = frameDocument.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const text = frameDocument.createTextNode('hello');
      const fragment = frameDocument.createDocumentFragment();

      for (const node of [element, svg, text, fragment, frameDocument]) {
        expect(node instanceof Node).toBe(false);
        expect(BuiltinX.isNode(node)).toBe(true);
      }

      expect(element instanceof Element).toBe(false);
      expect(BuiltinX.isElement(element)).toBe(true);
      expect(BuiltinX.isElement(svg)).toBe(true);
      expect(BuiltinX.isElement(text)).toBe(false);
      expect(BuiltinX.isElement(fragment)).toBe(false);
      expect(BuiltinX.isElement(frameDocument)).toBe(false);
    });

    it('recognizes adopted nodes whose owner document and original realm differ', () => {
      const element = frameDocument.createElement('div');
      const text = frameDocument.createTextNode('hello');
      document.adoptNode(element);
      document.adoptNode(text);

      expect(element.ownerDocument).toBe(document);
      expect(text.ownerDocument).toBe(document);
      expect(element instanceof Element).toBe(false);
      expect(text instanceof Node).toBe(false);
      expect(BuiltinX.isNode(element)).toBe(true);
      expect(BuiltinX.isElement(element)).toBe(true);
      expect(BuiltinX.isNode(text)).toBe(true);
      expect(BuiltinX.isElement(text)).toBe(false);
    });

    it('recognizes retained nodes after their iframe is removed', () => {
      const element = frameDocument.createElement('div');
      const text = frameDocument.createTextNode('hello');
      frame.remove();

      expect(BuiltinX.isNode(element)).toBe(true);
      expect(BuiltinX.isElement(element)).toBe(true);
      expect(BuiltinX.isNode(text)).toBe(true);
      expect(BuiltinX.isElement(text)).toBe(false);
    });
  });
});
