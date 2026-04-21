import { definePropertyIfAbsent } from '@/utils/object';

declare global {
  interface Response {
    /**
     * Returns the response when `ok` is true.
     *
     * Otherwise reads the response body as text and throws an error whose message
     * includes the HTTP status and, when available, the response text.
     *
     * This consumes the response body on error.
     */
    throwIfNotOk(): Promise<Response>;

    /**
     * Downloads the response body as a file.
     *
     * Throws when the response is not successful.
     */
    download(filename: string): Promise<void>;
  }
}

async function throwIfNotOk(this: Response): Promise<Response> {
  if (this.ok) {
    return this;
  }

  const text = await this.text();
  const statusLine = this.statusText
    ? `${this.status} ${this.statusText}`
    : `${this.status}`;
  const message = text.trim()
    ? `${statusLine}: ${text}`
    : statusLine;

  throw new Error(message);
}

async function download(this: Response, filename: string): Promise<void> {
  const response = await this.throwIfNotOk();
  const blob = await response.blob();
  await blob.download(filename);
}

definePropertyIfAbsent(Response.prototype, 'throwIfNotOk', throwIfNotOk);
definePropertyIfAbsent(Response.prototype, 'download', download);
