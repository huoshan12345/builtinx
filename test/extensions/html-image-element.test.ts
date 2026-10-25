import { expectTypeOf } from 'vitest';

describe('HTMLImageElement.whenLoaded', () => {
  function setState(image: HTMLImageElement, complete: boolean, naturalWidth = 0) {
    Object.defineProperties(image, {
      complete: { value: complete, configurable: true },
      naturalWidth: { value: naturalWidth, configurable: true },
    });
  }

  it('resolves with an already-loaded image', async () => {
    const image = document.createElement('img');
    setState(image, true, 20);
    await expect(image.whenLoaded()).resolves.toBe(image);
    expectTypeOf(image.whenLoaded()).toEqualTypeOf<Promise<HTMLImageElement>>();
  });

  it.each(['load', 'error'])('settles on %s and removes both listeners', async event => {
    const image = document.createElement('img');
    setState(image, false);
    const add = vi.spyOn(image, 'addEventListener');
    const remove = vi.spyOn(image, 'removeEventListener');
    const promise = image.whenLoaded();
    const assertion = event === 'load'
      ? expect(promise).resolves.toBe(image)
      : expect(promise).rejects.toThrow('Image failed to load');

    image.dispatchEvent(new Event(event));
    await assertion;
    expect(remove).toHaveBeenCalledWith('load', add.mock.calls[0][1]);
    expect(remove).toHaveBeenCalledWith('error', add.mock.calls[1][1]);
  });

  it.each(['', '/missing.png'])('rejects an already-failed src=%j', async src => {
    const image = document.createElement('img');
    image.setAttribute('src', src);
    setState(image, true);
    await expect(image.whenLoaded()).rejects.toThrow('Image failed to load');
  });

  it.each(['srcset', 'currentSrc'])('recognizes a completed failure from %s without src', async property => {
    const image = document.createElement('img');
    Object.defineProperty(image, property, { value: '/missing.png', configurable: true });
    setState(image, true);
    await expect(image.whenLoaded()).rejects.toThrow('Image failed to load');
  });

  it('waits without src and follows later source changes', async () => {
    const image = document.createElement('img');
    setState(image, true);
    const settled = vi.fn();
    const promise = image.whenLoaded();
    void promise.then(settled);
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();

    image.src = '/first.png';
    image.removeAttribute('src');
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();

    image.src = '/second.png';
    image.dispatchEvent(new Event('load'));
    await expect(promise).resolves.toBe(image);
  });

  it('keeps concurrent waits independent', async () => {
    const image = document.createElement('img');
    setState(image, false);
    const first = image.whenLoaded();
    const second = image.whenLoaded();
    image.dispatchEvent(new Event('load'));
    await expect(Promise.all([first, second])).resolves.toEqual([image, image]);
  });

  it('supports iframe images through the static method', async () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    try {
      const image = frame.contentDocument!.createElement('img');
      expect(image.whenLoaded).toBeUndefined();
      setState(image, false);
      const promise = BuiltinX.HTMLImageElement.whenLoaded(image);
      image.dispatchEvent(new Event('load'));
      await expect(promise).resolves.toBe(image);
    } finally {
      frame.remove();
    }
  });

  it('registers a non-enumerable method', () => {
    expect(Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'whenLoaded')).toMatchObject({
      enumerable: false,
      configurable: true,
      writable: true,
    });
  });
});
