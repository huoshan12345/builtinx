import { expectTypeOf } from 'vitest';
import { BuiltinX } from '@/index.js';

describe('BuiltinX.getType', () => {
  
  // 1. Primitive Types
  describe('Primitives', () => {
    it('should identify strings', () => {
      expect(BuiltinX.getType('hello')).toBe('string');
      expect(BuiltinX.getType('')).toBe('string');
    });

    it('should identify numbers', () => {
      expect(BuiltinX.getType(123)).toBe('number');
      expect(BuiltinX.getType(0)).toBe('number');
      expect(BuiltinX.getType(NaN)).toBe('number'); // NaN is technically a number in JS
      expect(BuiltinX.getType(Infinity)).toBe('number');
    });

    it('should identify booleans', () => {
      expect(BuiltinX.getType(true)).toBe('boolean');
      expect(BuiltinX.getType(false)).toBe('boolean');
    });

    it('should identify symbols', () => {
      expect(BuiltinX.getType(Symbol('foo'))).toBe('symbol');
    });

    it('should identify BigInts', () => {
      expect(BuiltinX.getType(10n)).toBe('bigint');
    });
  });

  // 2. Structural Types & Built-ins
  describe('Structural Types', () => {
    it('should identify null and undefined', () => {
      expect(BuiltinX.getType(null)).toBe('null');
      expect(BuiltinX.getType(undefined)).toBe('undefined');
    });

    it('should identify arrays', () => {
      expect(BuiltinX.getType([])).toBe('Array');
      expect(BuiltinX.getType([1, 2, 3])).toBe('Array');
    });

    it('should identify plain objects', () => {
      expect(BuiltinX.getType({})).toBe('object');
      expect(BuiltinX.getType({ a: 1 })).toBe('object');
    });

    it('should identify functions', () => {
      expect(BuiltinX.getType(() => {})).toBe('function');
      expect(BuiltinX.getType(function() {})).toBe('function');
      expect(BuiltinX.getType(async () => {})).toBe('function'); // Note: toString behavior
    });
  });

  // 3. Built-in Objects
  describe('Built-in Objects', () => {
    it('should identify Dates', () => {
      expect(BuiltinX.getType(new Date())).toBe('Date');
    });

    it('should identify Regular Expressions', () => {
      expect(BuiltinX.getType(/abc/)).toBe('RegExp');
      expect(BuiltinX.getType(new RegExp('abc'))).toBe('RegExp');
    });

    it('should identify Map, Set, and Promise', () => {
      expect(BuiltinX.getType(new Map())).toBe('Map');
      expect(BuiltinX.getType(new Set())).toBe('Set');
      expect(BuiltinX.getType(Promise.resolve())).toBe('Promise');
    });

    it('should identify Errors', () => {
      expect(BuiltinX.getType(new Error())).toBe('Error');
    });
  });

  // 4. Custom Classes & Edge Cases
  describe('Custom Classes & Edge Cases', () => {
    it('should identify custom classes as object (default behavior)', () => {
      class MyClass {}
      expect(BuiltinX.getType(new MyClass())).toBe('object');
    });

    it('should respect Symbol.toStringTag if defined', () => {
      class CustomTag {
        get [Symbol.toStringTag]() {
          return 'MyCustomClass';
        }
      }
      expect(BuiltinX.getType(new CustomTag())).toBe('MyCustomClass');
    });

    it('should handle Object.create(null)', () => {
      const obj = Object.create(null);
      expect(BuiltinX.getType(obj)).toBe('object');
    });
  });
});

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
