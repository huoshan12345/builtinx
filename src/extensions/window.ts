import type { Nullishable } from '../types/lib.js';
import type { SetParamOptions } from '../types/set-param-options.js';
import { definePropertyIfAbsent } from '../helpers/utils.js';

declare global {
  interface Window {
    /**
     * Replaces a query parameter without navigation or adding a history entry.
     * Preserves history.state. Nullish values delete by default; empty values
     * update existing keys but are not added unless addIfEmpty is true.
     * Setting a value collapses duplicate entries for the key.
     * Does not dispatch popstate/hashchange or notify framework routers.
     */
    setParam(name: string, value: Nullishable<string>, options?: Partial<SetParamOptions>): void;

    /** Deletes all entries for a query key, preserving history.state without navigation. */
    deleteParam(name: string): void;
  }
}

function replaceUrl(targetWindow: Window, url: URL): void {
  if (url.href !== targetWindow.location.href) {
    targetWindow.history.replaceState(targetWindow.history.state, '', url.href);
  }
}

/**
 * Updates the target window's query parameter with native set semantics.
 * Nullish values delete by default; otherwise they normalize to an empty string.
 * Empty values update existing keys; addIfEmpty controls adding missing keys.
 * Preserves history.state and does not navigate, add a history entry, or emit events.
 * Access to the target window's location/history must be permitted by the browser.
 */
export function setParam(
  targetWindow: Window,
  name: string,
  value: Nullishable<string>,
  options?: Partial<SetParamOptions>,
): void {
  const url = new URL(targetWindow.location.href);
  const removeIfNull = options?.removeIfNull ?? true;
  const addIfEmpty = options?.addIfEmpty ?? false;

  if (value == null && removeIfNull) {
    deleteParam(targetWindow, name);
    return;
  }

  const normalizedValue = value ?? '';
  if (normalizedValue === '' && !addIfEmpty && !url.searchParams.has(name)) {
    return;
  }

  url.searchParams.set(name, normalizedValue);
  replaceUrl(targetWindow, url);
}

/** Removes all entries for a query key using the target window's own history. */
export function deleteParam(targetWindow: Window, name: string): void {
  const url = new URL(targetWindow.location.href);
  if (!url.searchParams.has(name)) {
    return;
  }

  url.searchParams.delete(name);
  replaceUrl(targetWindow, url);
}

definePropertyIfAbsent(Window.prototype, 'setParam', function (
  this: Window,
  name: string,
  value: Nullishable<string>,
  options?: Partial<SetParamOptions>,
): void {
  setParam(this, name, value, options);
});

definePropertyIfAbsent(Window.prototype, 'deleteParam', function (this: Window, name: string): void {
  deleteParam(this, name);
});
