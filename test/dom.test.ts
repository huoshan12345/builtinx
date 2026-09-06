import { expectTypeOf } from 'vitest';
import { BuiltinX as importedBuiltinX } from '@/index.js';
import { Element as elementHelpers } from '@/helpers/element.js';
import { Node as nodeHelpers } from '@/helpers/node.js';
import { TimeSpan } from '@/utils/time-span.js';

describe('BuiltinX DOM methods across iframe realms', () => {
  let frame: HTMLIFrameElement;
  let frameDocument: Document;

  beforeEach(() => {
    frame = document.createElement('iframe');
    document.body.append(frame);
    frameDocument = frame.contentDocument!;
  });

  afterEach(() => {
    frame.remove();
  });

  it('retains the global object and existing helper groups', () => {
    expect(BuiltinX).toBe(importedBuiltinX);
    expect(BuiltinX.Element).toBe(elementHelpers);
    expect(BuiltinX.Node).toBe(nodeHelpers);
    expect(BuiltinX.Element.tagNames).toContain('div');
    expect(BuiltinX.Node.debounceMutationCallback).toBeTypeOf('function');
  });

  it('trims and collapses iframe nodes without installing iframe extensions', () => {
    const div = frameDocument.createElement('div');
    div.append(frameDocument.createTextNode('\n'));
    div.append(frameDocument.createElement('br'));
    div.append('Hello');
    div.append(frameDocument.createElement('br'));
    div.append(frameDocument.createTextNode('\n'));
    div.append(frameDocument.createElement('br'));
    div.append('World');

    expect(div.trimLeadingBrs).toBeUndefined();
    expect(div.firstChild!.isNewLineTextNode).toBeUndefined();
    expect(BuiltinX.Element.trimLeadingBrs(div)).toBe(div);
    expect(BuiltinX.Element.collapseBrs(div)).toBe(div);
    expect(div.innerHTML).toBe('Hello<br>World');
    expect(div.trimLeadingBrs).toBeUndefined();
    expectTypeOf(BuiltinX.Element.trimLeadingBrs(div)).toEqualTypeOf<HTMLDivElement>();
    expectTypeOf(BuiltinX.Element.collapseBrs(div)).toEqualTypeOf<HTMLDivElement>();
  });

  it('restores iframe HTML and SVG visibility and preserves their types', () => {
    const div = frameDocument.createElement('div');
    const svg = frameDocument.createElementNS('http://www.w3.org/2000/svg', 'svg');
    for (const element of [div, svg]) {
      element.style.display = 'inline';
      expect(BuiltinX.Element.setVisible(element, false)).toBe(element);
      expect(element.style.display).toBe('none');
      BuiltinX.Element.setVisible(element, false);
      expect(BuiltinX.Element.setVisible(element, true)).toBe(element);
      expect(element.style.display).toBe('inline');
    }
    expectTypeOf(BuiltinX.Element.setVisible(div, true)).toEqualTypeOf<HTMLDivElement>();
    expectTypeOf(BuiltinX.Element.setVisible(svg, true)).toEqualTypeOf<SVGSVGElement>();
  });

  it('uses the iframe document scroll offsets for document coordinates', () => {
    const div = frameDocument.createElement('div');
    vi.spyOn(div, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 20, 30, 40));
    vi.spyOn(window, 'scrollX', 'get').mockReturnValue(1000);
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(2000);
    Object.defineProperty(frame.contentWindow, 'scrollX', { value: 50, configurable: true });
    Object.defineProperty(frame.contentWindow, 'scrollY', { value: 60, configurable: true });

    const rect = BuiltinX.Element.getDocumentRect(div);
    expect([rect.x, rect.y, rect.width, rect.height]).toEqual([60, 80, 30, 40]);
    expectTypeOf(rect).toEqualTypeOf<DOMRectReadOnly>();
  });

  it('handles an element whose document has no window', () => {
    const detachedDocument = document.implementation.createHTMLDocument();
    const div = detachedDocument.createElement('div');
    vi.spyOn(div, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 20, 30, 40));

    const rect = BuiltinX.Element.getDocumentRect(div);
    expect([rect.x, rect.y]).toEqual([10, 20]);
  });

  it('reads iframe nodes through static methods', () => {
    const div = frameDocument.createElement('div');
    div.innerHTML = 'Hello<span>nested</span>World';
    const newline = frameDocument.createTextNode('\n');

    expect(BuiltinX.Node.ownText(div)).toBe('HelloWorld');
    expect(BuiltinX.Node.ownText(newline)).toBe('\n');
    expect(BuiltinX.Node.isTextNode(newline)).toBe(true);
    expect(BuiltinX.Node.isTextNode(div)).toBe(false);
    expect(BuiltinX.Node.isNewLineTextNode(newline)).toBe(true);
    expect(BuiltinX.Node.isNewLineTextNode(div.firstChild!)).toBe(false);
  });

  it('observes iframe mutations without requiring iframe prototype extensions', async () => {
    const div = frameDocument.createElement('div');
    const callback = vi.fn();
    const observer = BuiltinX.Node.observe(div, callback, { debounce: false });
    try {
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.calls[0][2]).toBe(div);
      div.append(frameDocument.createElement('span'));
      await vi.waitFor(() => expect(callback).toHaveBeenCalledTimes(2));
      expect(callback.mock.calls[1][0][0].target).toBe(div);
      expect(div.observe).toBeUndefined();
    } finally {
      observer.disconnect();
    }
  });

  it.each(['localStorage', 'sessionStorage'] as const)(
    'supports iframe %s with its separate, unextended Storage prototype',
    async storageName => {
      const storage = frame.contentWindow![storageName];
      storage.clear();
      expect(Object.getPrototypeOf(storage) === Storage.prototype).toBe(false);
      expect(storage.getCache).toBeUndefined();
      const expiration = TimeSpan.fromMinutes(1);

      BuiltinX.Storage.setCache(storage, 'value', { id: 1 }, expiration);
      expect(BuiltinX.Storage.getCache<{ id: number }>(storage, 'value')).toEqual({ id: 1 });
      expect(BuiltinX.Storage.takeCache<{ id: number }>(storage, 'value')).toEqual({ id: 1 });
      expect(BuiltinX.Storage.getCache(storage, 'value')).toBeNull();
      storage.setItem('json', '{"id":2}');
      expect(BuiltinX.Storage.getJsonValue<{ id: number }>(storage, 'json')).toEqual({ id: 2 });

      const factory = vi.fn(() => 3);
      expect(await BuiltinX.Storage.getOrCreateCacheAsync(storage, 'created', factory, expiration)).toBe(3);
      expect(await BuiltinX.Storage.getOrCreateCacheAsync(storage, 'created', factory, expiration)).toBe(3);
      expect(factory).toHaveBeenCalledTimes(1);
      BuiltinX.Storage.setCache(storage, 'expired', 0, TimeSpan.fromMilliseconds(-1));
      BuiltinX.Storage.cleanupExpired(storage);
      expect([...BuiltinX.Storage.keys(storage)].sort()).toEqual(['created', 'json']);
      expect(storage.getCache).toBeUndefined();
      expectTypeOf(BuiltinX.Storage.getCache<number>(storage, 'created')).toEqualTypeOf<number | null>();
    },
  );

  it('retries a failed iframe storage write using static cleanup', () => {
    const storage = frame.contentWindow!.localStorage;
    storage.clear();
    storage.setItem('expired', JSON.stringify({ value: 1, expire: 0 }));
    vi.spyOn(Object.getPrototypeOf(storage), 'setItem').mockImplementationOnce(() => {
      throw new DOMException('Storage full', 'QuotaExceededError');
    });

    BuiltinX.Storage.setCache(storage, 'new', 2, TimeSpan.fromMinutes(1));
    expect(storage.getItem('expired')).toBeNull();
    expect(BuiltinX.Storage.getCache<number>(storage, 'new')).toBe(2);
  });
});
