describe('BuiltinX entry points', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('BuiltinX', BuiltinX);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('imports core helpers without DOM globals', async () => {
    vi.stubGlobal('Node', undefined);
    vi.stubGlobal('Element', undefined);
    vi.stubGlobal('document', undefined);
    vi.stubGlobal('window', undefined);

    const { BuiltinX } = await import('@/index.js');

    expect(BuiltinX.getType([])).toBe('Array');
    expect(BuiltinX.isString('hello')).toBe(true);
    expect(BuiltinX).not.toHaveProperty('isNode');
    expect(BuiltinX).not.toHaveProperty('isElement');
  });

  it('adds DOM guards to the existing namespace only when the DOM entry loads', async () => {
    const { BuiltinX } = await import('@/index.js');

    expect(BuiltinX).not.toHaveProperty('isNode');
    expect(BuiltinX).not.toHaveProperty('isElement');

    await import('@/dom.js');

    expect(Reflect.get(globalThis, 'BuiltinX')).toBe(BuiltinX);
    expect((await import('@/index.js')).BuiltinX).toBe(BuiltinX);
    expect(BuiltinX.isNode(document.createTextNode('hello'))).toBe(true);
    expect(BuiltinX.isElement(document.createTextNode('hello'))).toBe(false);
    expect(BuiltinX.isElement(document.createElement('div'))).toBe(true);
  });
});
