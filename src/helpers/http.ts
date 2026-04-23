import { HttpError } from '@/utils/http-error';
import type { Nullable, URLLike } from '@/types/lib';

export interface Http {
  /**
   * Creates a Blob from a string and initiates a download.
   * @param text The text content to download.
   * @param filename The name of the file to be saved.
   * @param type The MIME type of the content. Defaults to 'plain/text'.
   */
  downloadText(text: string, filename: string, type?: string): void;

  /**
   * Fetches a resource from a URL and initiates a download for it.
   * @param url The URL of the resource to download.
   * @param filename The name of the file to be saved.
   * @returns A promise that resolves when the download is initiated.
   */
  download(url: URLLike, filename: string): Promise<void>;

  /**
   * A wrapper around the global `fetch` function that provides improved JSON parsing and error handling.
   * It automatically parses the response as JSON if the content-type indicates it, otherwise as text.
   * On a non-ok response (status >= 400), it throws an `HttpError` containing the status, body, and original response.
   * @param input The resource to fetch. This can be a string, URL, or Request object.
   * @param init An object containing any custom settings that you want to apply to the request.
   * @returns A promise that resolves with the parsed response data.
   * @template T The expected type of the response data.
   */
  request<T = unknown>(input: string | URL | Request, init?: RequestInit): Promise<Nullable<T>>;
}

export const Http: Http = {
  downloadText(text: string, filename: string, type: string = 'plain/text'): Promise<void> {
    const blob = new Blob([text], { type: type });
    return blob.download(filename);
  },

  async download(url: URLLike, filename: string): Promise<void> {
    const res = await fetch(url);
    return await res.download(filename);
  },

  async request<T = unknown>(input: string | URL | Request, init?: RequestInit): Promise<Nullable<T>> {
    const res = await fetch(input, init);

    // Handle successful responses with no content.
    if (res.status === 204) {
      return null;
    }

    let data: unknown = null;
    const contentType = res.headers.get('content-type');

    const raw = await res.text();
    if (contentType?.includes('application/json')) {
      data = raw
        ? JSON.parse(raw)
        : null;
    } else {
      data = raw;
    }

    if (!res.ok) {
      throw new HttpError(`HTTP ${res.status}: ${res.statusText}`, res.status, data, res);
    }

    return data as Nullable<T>;
  },
}