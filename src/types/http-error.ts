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
