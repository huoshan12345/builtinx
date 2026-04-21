import { URLLike } from '@/types/lib';

export namespace Http {
  export function downloadText(text: string, filename: string, type: string = 'plain/text') {
    const blob = new Blob([text], { type: type });
    return blob.download(filename);
  }

  export function download(url: URLLike, filename: string) {
    return fetch(url)
      .then(res => res.download(filename))
      .catch(e => alert('Failed to download: ' + e));
  }
}