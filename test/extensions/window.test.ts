import { expectTypeOf } from 'vitest';
import type { SetParamOptions } from '@/dom.js';

describe('Window query parameter extensions', () => {
  // Vitest's global window is a wrapper outside Window.prototype's chain.
  // Invoke the installed methods explicitly with that window as the receiver.
  const initialUrl = window.location.href;
  const initialState = window.history.state;

  beforeEach(() => {
    window.history.replaceState({ route: 'search', scrollY: 240 }, '', '/search?keep=1#results');
  });

  afterEach(() => {
    window.history.replaceState(initialState, '', initialUrl);
  });

  it('updates the address bar while preserving state, path, hash and history length', () => {
    const length = window.history.length;
    const replace = vi.spyOn(window.history, 'replaceState');
    Window.prototype.setParam.call(window, 'q', 'hello world');

    expect(window.location.pathname).toBe('/search');
    expect(window.location.search).toBe('?keep=1&q=hello+world');
    expect(window.location.hash).toBe('#results');
    expect(window.history.state).toEqual({ route: 'search', scrollY: 240 });
    expect(window.history.length).toBe(length);
    expect(replace).toHaveBeenCalledWith(window.history.state, '', window.location.href);
  });

  const cases: [string, string, string | null | undefined, Partial<SetParamOptions> | undefined, string][] = [
    ['missing nonempty', '', 'a', undefined, '?q=a'],
    ['existing nonempty', '?q=old', 'a', undefined, '?q=a'],
    ['missing empty', '', '', undefined, ''],
    ['existing nonempty to empty', '?q=old', '', undefined, '?q='],
    ['existing empty', '?q=', '', undefined, '?q='],
    ['missing null', '', null, undefined, ''],
    ['existing null', '?q=old', null, undefined, ''],
    ['existing undefined', '?q=old', undefined, undefined, ''],
    ['add empty', '', '', { addIfEmpty: true }, '?q='],
    ['add normalized null', '', null, { removeIfNull: false, addIfEmpty: true }, '?q='],
    ['add normalized undefined', '', undefined, { removeIfNull: false, addIfEmpty: true }, '?q='],
    ['skip normalized null', '', null, { removeIfNull: false }, ''],
    ['clear existing with null', '?q=old', null, { removeIfNull: false }, '?q='],
    ['delete takes precedence', '?q=old', null, { addIfEmpty: true }, ''],
    ['first duplicate matches', '?q=a&q=b', 'a', undefined, '?q=a'],
    ['last duplicate matches', '?q=a&q=b', 'b', undefined, '?q=b'],
    ['empty duplicates', '?q=&q=b', '', undefined, '?q='],
    ['delete duplicates', '?q=a&q=b', null, undefined, ''],
  ];

  it.each(cases)('%s', (_, search, value, options, expected) => {
    window.history.replaceState(window.history.state, '', `/search${search}#results`);
    Window.prototype.setParam.call(window, 'q', value, options);
    expect(window.location.search).toBe(expected);
    expect(window.location.hash).toBe('#results');
  });

  it('deletes all matching entries and preserves other parameters and history state', () => {
    window.history.replaceState({ page: 3 }, '', '/search?q=a&keep=1&q=b#results');
    Window.prototype.deleteParam.call(window, 'q');
    expect(window.location.search).toBe('?keep=1');
    expect(window.location.hash).toBe('#results');
    expect(window.history.state).toEqual({ page: 3 });
  });

  it('skips replaceState when the URL does not change', () => {
    const replace = vi.spyOn(window.history, 'replaceState');
    Window.prototype.setParam.call(window, 'keep', '1');
    Window.prototype.setParam.call(window, 'missing', '');
    Window.prototype.setParam.call(window, 'missing', null);
    Window.prototype.deleteParam.call(window, 'missing');
    expect(replace).not.toHaveBeenCalled();
  });

  it('encodes names and values without losing the fragment', () => {
    Window.prototype.setParam.call(window, 'a&b', 'x=1&y=2#z');
    expect(new URL(window.location.href).searchParams.get('a&b')).toBe('x=1&y=2#z');
    expect(window.location.hash).toBe('#results');
  });

  it('does not emit navigation events', async () => {
    const listener = vi.fn();
    window.addEventListener('popstate', listener);
    window.addEventListener('hashchange', listener);
    try {
      Window.prototype.setParam.call(window, 'q', 'a');
      Window.prototype.deleteParam.call(window, 'q');
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(listener).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('popstate', listener);
      window.removeEventListener('hashchange', listener);
    }
  });

  it('uses an iframe window\'s own location and history through static methods', () => {
    const frame = document.createElement('iframe');
    frame.src = new URL('/frame?keep=2#inner', window.location.href).href;
    document.body.append(frame);
    try {
      const target = frame.contentWindow!;
      target.history.replaceState({ frame: true }, '', '/frame?keep=2#inner');
      const parentHref = window.location.href;
      const parentState = window.history.state;

      expect(target.setParam).toBeUndefined();
      BuiltinX.Window.setParam(target, 'q', 'a');
      expect(target.location.search).toBe('?keep=2&q=a');
      expect(target.location.hash).toBe('#inner');
      expect(target.history.state).toEqual({ frame: true });
      BuiltinX.Window.deleteParam(target, 'q');
      expect(target.location.search).toBe('?keep=2');
      expect(window.location.href).toBe(parentHref);
      expect(window.history.state).toEqual(parentState);
    } finally {
      frame.remove();
    }
  });

  it('accepts partial options and requires the value argument', () => {
    const options: Partial<SetParamOptions> = { addIfEmpty: true };
    expectTypeOf(window.setParam).parameter(2).toEqualTypeOf<Partial<SetParamOptions> | undefined>();
    Window.prototype.setParam.call(window, 'q', '', options);
    if (false) {
      // @ts-expect-error The value argument must be supplied explicitly.
      Window.prototype.setParam.call(window, 'q');
    }
  });

  it.each(['setParam', 'deleteParam'])('registers %s as non-enumerable', name => {
    expect(Object.getOwnPropertyDescriptor(Window.prototype, name)).toMatchObject({
      value: expect.any(Function),
      enumerable: false,
      writable: true,
      configurable: true,
    });
  });
});
