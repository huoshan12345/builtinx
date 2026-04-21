/**
 * Represents an error that occurred during an HTTP request.
 */
export class HttpError extends Error {
  /** The HTTP status code of the response. */
  public readonly status: number;
  /** The data parsed from the response body, if any. */
  public readonly data: unknown;
  /** The original Response object. */
  public readonly response: Response;

  constructor(message: string, status: number, data: unknown, response: Response) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
    this.response = response;
  }
}

export namespace Fetch {
  /**
   * A wrapper around the global `fetch` function that provides improved JSON parsing and error handling.
   * It automatically parses the response as JSON if the content-type indicates it, otherwise as text.
   * On a non-ok response (status >= 400), it throws an `HttpError` containing the status, body, and original response.
   * @param input The resource to fetch. This can be a string, URL, or Request object.
   * @param init An object containing any custom settings that you want to apply to the request.
   * @returns A promise that resolves with the parsed response data.
   * @template T The expected type of the response data.
   */
  export async function request<T = unknown>(
    input: string | URL | Request,
    init?: RequestInit
  ): Promise<T> {
    const res = await fetch(input, init);

    // Handle successful responses with no content.
    if (res.status === 204) {
      return undefined as T;
    }

    let data: unknown;
    const contentType = res.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      // Use a try-catch block in case the body is empty despite the header
      try {
        data = await res.json();
      } catch {
        data = null;
      }
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      throw new HttpError(`HTTP ${res.status}: ${res.statusText}`, res.status, data, res);
    }

    return data as T;
  }
}