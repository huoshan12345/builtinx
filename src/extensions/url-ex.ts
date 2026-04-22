import type { URLLike } from '@/types/lib';
import { definePropertyIfAbsent } from '@/utils/object';

declare global {
  var URLEx: typeof globalThis.URL & {
    /**
     * Creates a URL instance from an absolute or relative input.
     *
     * Throws a TypeError with a normalized message when the input is invalid.
     */
    create(url: string | URL, base?: string | URL): URL;

    /**
     * Navigates to the specified URL-like value.
     *
     * If `openInNewTab` is true, navigation happens in a new tab.
     * If `noReferrer` is true, navigation is performed through a temporary anchor
     * element with `noreferrer` and `noopener`.
     */
    goto(url: URLLike | undefined | null, openInNewTab?: boolean, noReferrer?: boolean): void;

    /**
     * Builds a URL by appending cleaned path segments to a base URL.
     *
     * Leading and trailing spaces and slashes are trimmed from each segment.
     * Empty segments are ignored.
     */
    fromSegments(base: string | URL, ...segments: string[]): URL;
  };
}

function navigateByAnchor(href: string, target: "_self" | "_blank", rel?: string): void {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.target = target;
  if (rel) {
    anchor.rel = rel;
  }
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function create(url: string | URL, base?: string | URL) {
  try {
    return new URL(url, base);
  } catch (e) {
    const u = url instanceof URL ? url.href : String(url);
    const b =
      base === undefined
        ? ""
        : base instanceof URL
          ? base.href
          : String(base);

    const message = base === undefined
      ? `Invalid URL: ${u}`
      : `Invalid URL: ${u} (base: ${b})`;

    throw new TypeError(message);
  }
};

function goto(url: URLLike | undefined | null, openInNewTab: boolean = false, noReferrer: boolean = false): void {
  if (!url)
    return;

  const href = url.toString();

  if (noReferrer) {
    navigateByAnchor(href, openInNewTab ? "_blank" : "_self", "noreferrer noopener");
    return;
  }

  if (openInNewTab === true) {
    navigateByAnchor(href, "_blank", "noopener");
  } else {
    window.location.href = href;
  }
};

function fromSegments(base: string | URL, ...segments: string[]): URL {
  const baseUrl = create(base.toString());
  const existing = baseUrl.pathname
    .split("/")
    .filter(Boolean); // remove empty segments caused by consecutive slashes

  for (const segment of segments) {
    const trimmed = segment.trimChars(" /");
    if (trimmed) {
      existing.push(trimmed);
    }
  }

  baseUrl.pathname = "/" + existing.join("/");
  return baseUrl;
};

definePropertyIfAbsent(URL, "create", create);
definePropertyIfAbsent(URL, "goto", goto);
definePropertyIfAbsent(URL, "fromSegments", fromSegments);
globalThis.URLEx = URL as any;
