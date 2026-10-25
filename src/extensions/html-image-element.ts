import { definePropertyIfAbsent } from '../helpers/utils.js';

declare global {
  interface HTMLImageElement {
    /**
     * Resolves with this image when loaded, or rejects with Error on failure.
     * Without an image source, waits for a future load/error event.
     * Source changes while waiting follow the element's next load/error event.
     */
    whenLoaded<T extends HTMLImageElement>(this: T): Promise<T>;
  }
}

/**
 * Resolves immediately for an already-loaded image and rejects for a completed
 * failed image with a source. Otherwise waits for load/error and cleans up both
 * listeners on settlement. No source means waiting for a future event; changing
 * the source does not cancel the wait or pin it to the original URL.
 */
export function whenLoaded<T extends HTMLImageElement>(image: T): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const cleanup = () => {
      image.removeEventListener('load', onLoad);
      image.removeEventListener('error', onError);
    };
    const onLoad = () => {
      cleanup();
      resolve(image);
    };
    const onError = () => {
      cleanup();
      reject(new Error('Image failed to load'));
    };

    image.addEventListener('load', onLoad, { once: true });
    image.addEventListener('error', onError, { once: true });

    if (image.complete) {
      if (image.naturalWidth > 0) {
        onLoad();
      } else if (image.currentSrc || image.hasAttribute('src') || image.srcset.trim()) {
        onError();
      }
    }
  });
}

definePropertyIfAbsent(HTMLImageElement.prototype, 'whenLoaded', function <T extends HTMLImageElement>(
  this: T,
): Promise<T> {
  return whenLoaded(this);
});
