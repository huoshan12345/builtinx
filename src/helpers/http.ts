import { URLLike } from '@/types/lib';

export namespace Http {
  /**
   * Creates a Blob from a string and initiates a download.
   * @param text The text content to download.
   * @param filename The name of the file to be saved.
   * @param type The MIME type of the content. Defaults to 'plain/text'.
   */
  export function downloadText(text: string, filename: string, type: string = 'plain/text') {
    const blob = new Blob([text], { type: type });
    return blob.download(filename);
  }

  /**
   * Fetches a resource from a URL and initiates a download for it.
   * @param url The URL of the resource to download.
   * @param filename The name of the file to be saved.
   * @returns A promise that resolves when the download is initiated.
   */
  export function download(url: URLLike, filename: string) {
    return fetch(url).then(res => res.download(filename));
  }
}