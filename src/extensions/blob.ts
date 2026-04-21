import { definePropertyIfAbsent } from '@/utils/object';

declare global {
  interface Blob {
    /**
     * Converts the Blob to a Base64 string.
     *
     * Returns only the Base64 content,
     * excluding the data URL prefix.
     */
    toBase64(): Promise<string>;

    /**
     * Downloads the Blob as a file.
     *
     * Creates a temporary object URL and triggers a browser download.
     */
    download(fileName: string, revokeDelay?: number): Promise<void>;
  }
}

function toBase64(this: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const index = result.indexOf(",");

      resolve(index >= 0 ? result.slice(index + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(this);
  });
};

function download(this: Blob, fileName: string, revokeDelay: number = 0): Promise<void> {
  const url = URL.createObjectURL(this);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.style.display = "none";

  document.body.appendChild(a);
  a.click();
  a.remove();

  return new Promise(resolve => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      resolve();
    }, revokeDelay);
  });
};

definePropertyIfAbsent(Blob.prototype, 'toBase64', toBase64);
definePropertyIfAbsent(Blob.prototype, 'download', download);